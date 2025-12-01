from flask import Flask, render_template, jsonify, request
import sqlite3
from datetime import datetime, timedelta
import csv
import os
from io import StringIO

app = Flask(__name__)



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

if __name__ == '__main__':
    print("Доступные endpoints:")
    print("  http://localhost:5000 - главная страница с графиками")
    print("  http://localhost:5000/api/languages - список языков")
    print("  http://localhost:5000/api/timeseries?languages[]=Python&languages[]=Java - временные ряды")
    print("  http://localhost:5000/api/stats - статистика")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
