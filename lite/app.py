from flask import Flask, render_template, jsonify, request
import sqlite3
from datetime import datetime, timedelta
import csv
import os
from io import StringIO
import requests
from datetime import datetime, timedelta
from collections import OrderedDict
import re
import threading
import json


app = Flask(__name__, static_folder='static')
app.secret_key = 'your-secret-key-here'

# Главная страница
@app.route('/')
def index():
    return render_template('index.html')

# API: Получить список всех языков
@app.route('/api/languages')
def get_languages_list():
    conn = sqlite3.connect('djdb.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT name FROM lang ORDER BY name")
    languages = [row[0] for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'languages': languages
    })

# API: Получить временные ряды для выбранных языков
@app.route('/api/timeseries')
def get_timeseries():
    # Получаем выбранные языки из параметров запроса
    selected_languages = request.args.getlist('languages[]')
    
    if not selected_languages:
        return jsonify({'error': 'No languages selected'}), 400
    
    conn = sqlite3.connect('djdb.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Получаем все уникальные даты
    cursor.execute("SELECT DISTINCT date_added FROM lang ORDER BY date_added")
    all_dates = [row['date_added'] for row in cursor.fetchall()]
    
    # Данные для каждого языка
    timeseries_data = {}
    
    for lang in selected_languages:
        cursor.execute('''
            SELECT date_added, val, val_noexp, res_vac 
            FROM lang 
            WHERE name = ? 
            ORDER BY date_added
        ''', (lang,))
        
        rows = cursor.fetchall()
        
        # Создаем словарь для быстрого доступа по дате
        lang_data = {row['date_added']: dict(row) for row in rows}
        
        # Заполняем значения для всех дат (если данных нет, используем None)
        val_series = []
        val_noexp_series = []
        res_vac_series = []
        
        for date in all_dates:
            if date in lang_data:
                val_series.append(lang_data[date]['val'])
                val_noexp_series.append(lang_data[date]['val_noexp'])
                res_vac_series.append(lang_data[date]['res_vac'])
            else:
                val_series.append(None)
                val_noexp_series.append(None)
                res_vac_series.append(None)
        
        timeseries_data[lang] = {
            'val': val_series,
            'val_noexp': val_noexp_series,
            'res_vac': res_vac_series
        }
    
    conn.close()
    
    return jsonify({
        'dates': all_dates,
        'data': timeseries_data,
        'selected_languages': selected_languages
    })

# API: Получить статистику по языкам
@app.route('/api/stats')
def get_stats():
    conn = sqlite3.connect('djdb.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Последние значения для каждого языка
    cursor.execute('''
        SELECT 
            name,
            MAX(date_added) as last_date,
            (SELECT val FROM lang l2 WHERE l2.name = l1.name ORDER BY date_added DESC LIMIT 1) as last_val,
            (SELECT val_noexp FROM lang l2 WHERE l2.name = l1.name ORDER BY date_added DESC LIMIT 1) as last_val_noexp,
            (SELECT res_vac FROM lang l2 WHERE l2.name = l1.name ORDER BY date_added DESC LIMIT 1) as last_res_vac
        FROM lang l1
        GROUP BY name
        ORDER BY last_val DESC
    ''')
    
    stats = cursor.fetchall()
    
    # Общая статистика
    cursor.execute('''
        SELECT 
            COUNT(DISTINCT name) as total_languages,
            COUNT(*) as total_records,
            MIN(date_added) as first_date,
            MAX(date_added) as last_date
        FROM lang
    ''')
    
    overall_stats = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'languages_stats': [dict(row) for row in stats],
        'overall_stats': dict(overall_stats)
    })

# API: Получить данные для конкретного языка
@app.route('/api/language/<name>')
def get_language_data(name):
    conn = sqlite3.connect('djdb.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT date_added, val, val_noexp, res_vac 
        FROM lang 
        WHERE name = ? 
        ORDER BY date_added
    ''', (name,))
    
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        return jsonify({'error': 'Language not found'}), 404
    
    # Преобразуем данные в списки
    dates = [row['date_added'] for row in rows]
    val = [row['val'] for row in rows]
    val_noexp = [row['val_noexp'] for row in rows]
    res_vac = [row['res_vac'] for row in rows]
    
    conn.close()
    
    return jsonify({
        'name': name,
        'dates': dates,
        'val': val,
        'val_noexp': val_noexp,
        'res_vac': res_vac
    })
    
# ====================== ВСТРОЕННОЕ КЭШИРОВАНИЕ ======================
class SimpleCache:
    """Простой кэш в памяти с TTL"""
    def __init__(self):
        self.cache = {}
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                data, expiry = self.cache[key]
                if expiry > datetime.now():
                    return data
                del self.cache[key]
            return None
    
    def set(self, key, value, ttl=300):
        with self.lock:
            self.cache[key] = (value, datetime.now() + timedelta(seconds=ttl))
    
    def clear(self):
        with self.lock:
            self.cache.clear()

# Глобальный кэш
cache = SimpleCache()
CACHE_TTL = 300  # 5 минут

# ====================== ОСНОВНАЯ ЛОГИКА КУРСОВ ВАЛЮТ ======================
def parse_currency(dif_days, now=False):
    """Парсинг курсов валют с кэшированием"""
    cache_key = f"parse_currency_{dif_days}_{now}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    url = 'http://www.cbr.ru/scripts/XML_daily.asp'
    today = datetime.now() - timedelta(days=dif_days)
    date_str = today.strftime("?date_req=%d/%m/%Y")
    
    try:
        response = requests.get(url + date_str, timeout=10)
        response.raise_for_status()
        currency = response.content.decode("cp1251").split('>')
    except Exception as e:
        print(f"Ошибка при запросе: {e}")
        # Возвращаем пустой словарь и текущую дату
        result = ({}, datetime.now().strftime("%d.%m.%Y"))
        cache.set(cache_key, result, CACHE_TTL)
        return result
    
    dict_curr = {}
    # Извлекаем дату из ответа
    date_delta = currency[1]
    if not now:
        date_delta = re.sub(r'[^0-9.]', '', date_delta)
    
    # Парсим валюты
    for i in range(len(currency)):
        if currency[i] == '<CharCode':
            char_code = currency[i + 1].split('<')[0]
            nominal = float(currency[i + 3].split('<')[0])
            value = float(currency[i + 7].split('<')[0].replace(',', '.'))
            dict_curr[char_code] = value / nominal
    
    result = (dict_curr, date_delta)
    cache.set(cache_key, result, CACHE_TTL)
    return result

def get_ordered_array(delta_val):
    """Получение отсортированного массива изменений валют"""
    cache_key = f"currency_diff_{delta_val}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        now_rates, now_date = parse_currency(0, now=True)
        delta_rates, delta_date = parse_currency(delta_val, now=False)
        
        order_dif = {}
        # Исключаемые валюты (как в оригинальном коде)
        excluded_currencies = {
            'BYN', 'HUF', 'KGS', 'MDL', 'TJS', 'UZS', 'HKD', 'AZN', 
            'AMD', 'TMT', 'CZK', 'DKK', 'BGN', 'RON', 'RSD', 'GEL', 
            'NZD', 'THB', 'VND', 'AED', 'QAR', 'EGP', 'IDR', 'IRR', 
            'ETB', 'BHD', 'BOB', 'CUP', 'MNT', 'OMR', 'SAR', 'MMK', 
            'BDT', 'DZD', 'NGN'
        }
        
        for key in now_rates.keys():
            if key not in excluded_currencies and key in delta_rates:
                try:
                    change_percent = round((now_rates[key] / delta_rates[key] - 1) * 100, 2)
                    order_dif[key] = change_percent
                except (KeyError, ZeroDivisionError):
                    continue
        
        # Сортируем по убыванию изменения
        ordered_result = OrderedDict(sorted(order_dif.items(), 
                                          key=lambda item: item[1], 
                                          reverse=True))
        
        result = (list(ordered_result.items()), delta_date)
        
        # Кэшируем результат
        cache.set(cache_key, result, CACHE_TTL)
        return result
        
    except Exception as e:
        print(f"Ошибка в get_ordered_array для delta={delta_val}: {e}")
        return [], datetime.now().strftime("%d.%m.%Y")

# ====================== ФУНКЦИИ ДЛЯ АКЦИЙ МОЕХ ======================
def get_moex_stocks(days=2):
    """Получение данных об акциях Мосбиржи (заглушка)"""
    return {
        'status': 'success',
        'message': 'Данные загружаются через JavaScript на клиенте'
    }

# ====================== FLASK РОУТЫ ======================
@app.route('/currencies', methods=['GET', 'POST'])
def currencies():
    """Основной роут для отображения валют"""
    # Значения по умолчанию
    default_deltas = [7, 365, 1460, 4018]
    deltas = default_deltas.copy()
    
    # Обработка формы
    if request.method == 'POST' or request.args.get('mybtn'):
        try:
            # Пробуем получить значения из формы
            form_data = request.form if request.method == 'POST' else request.args
            deltas = [
                int(form_data.get('mytextbox0', default_deltas[0])),
                int(form_data.get('mytextbox1', default_deltas[1])),
                int(form_data.get('mytextbox2', default_deltas[2])),
                int(form_data.get('mytextbox3', default_deltas[3]))
            ]
        except (ValueError, TypeError):
            deltas = default_deltas
    
    # Получаем данные для всех периодов
    data_dict = {}
    for i, delta in enumerate(deltas):
        data, date_val = get_ordered_array(delta)
        data_dict[f'dif_plus{i}'] = data
        data_dict[f'date_delta{i}'] = date_val
        data_dict[f'delta{i}'] = delta
    
    # Передаем все переменные напрямую в шаблон
    return render_template('currencies.html', **data_dict)

@app.route('/api/currencies/<int:days>')
def api_currencies(days):
    """API для получения данных по валютам в формате JSON"""
    if days <= 0 or days > 10000:
        return jsonify({'error': 'Дни должны быть от 1 до 10000'}), 400
    
    result, date_val = get_ordered_array(days)
    return jsonify({
        'date': date_val,
        'days': days,
        'currencies': dict(result),
        'count': len(result)
    })

@app.route('/api/moex/<int:days>')
def api_moex(days):
    """API для данных MOEX (заглушка)"""
    if days < 2 or days > 3000:
        return jsonify({'error': 'Дни должны быть от 2 до 3000'}), 400
    
    # Здесь можно реализовать парсинг MOEX на сервере
    return jsonify({
        'days': days,
        'stocks': [],
        'message': 'Используйте JavaScript для загрузки данных с MOEX'
    })

@app.route('/clear_cache')
def clear_cache():
    """Очистка кэша"""
    cache.clear()
    return "✅ Кэш очищен! <a href='/'>Вернуться на главную</a>"

if __name__ == '__main__':
    print("Доступные endpoints:")
    print("  http://localhost:5000 - главная страница с графиками")
    print("  http://localhost:5000/api/languages - список языков")
    print("  http://localhost:5000/api/timeseries?languages[]=Python&languages[]=Java - временные ряды")
    print("  http://localhost:5000/api/stats - статистика")
    print("👉 API валют: http://localhost:5000/api/currencies/30")
    print("👉 Очистка кэша: http://localhost:5000/clear_cache")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
