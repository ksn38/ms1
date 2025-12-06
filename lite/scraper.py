import sqlite3
import os
from datetime import date
import requests
import json
import time
import pandas as pd
import json
from datetime import datetime
from datetime import timedelta


con = sqlite3.connect("djdb.db")
cur = con.cursor()

def apivac(expir):
    vac = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i + '+not+%D0%BF%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%B0%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C+not+%D0%BA%D1%83%D1%80%D1%8C%D0%B5%D1%80'
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        print(i, val['found'])
        time.sleep(1)

    return vac
    
def parservac():
    res = {'Python': 68289, 'C%23': 28055, 'c%2B%2B': 28567, 'Java': 58438, 'Javascript': 18803, 'php': 24923, 'Ruby': 1771,\
    'Golang': 12925, '1c': 222643, 'Data scientist': 18694, 'Scala': 462, 'iOS': 10456, 'Frontend': 105870, 'DevOps': 23971, 'ABAP': 1365, 'Android': 13979}

    return res
    
date_today = date.today().strftime("%Y-%m-%d")
data = []

def get_hh():
    noexp = 'experience=noExperience&'
    vacs = apivac('')
    vacs_noexp = apivac(noexp)
    res = parservac()

    for k, k2 in zip(vacs.keys(), res.keys()):
        res[k2] = round(res[k2] / vacs[k], 1)
        vacs_noexp[k] = round(vacs_noexp[k] * 100 / vacs[k])

    for k, v, vne, rv in zip(vacs.keys(), vacs.values(), vacs_noexp.values(), res.values()):
        if k == 'c%2B%2B':
            k = 'cpp'
        if k == 'C%23':
            k = 'cs'
        data.append((k, v, vne, rv, date_today))

    return data

last_date = cur.execute("SELECT date_added FROM lang order by id desc limit 1").fetchone()[0]

# Преобразование строк в даты
date_today = datetime.strptime(date_today, "%Y-%m-%d")
last_date = datetime.strptime(last_date, "%Y-%m-%d")

data = get_hh()

dif = (date_today - last_date).days
data_prev = []

while dif != 0:
    dif -= 1
    for i in data:
        data_prev.append((i[0], i[1], i[2], i[3], (i[4] - timedelta(dif)).strftime("%Y-%m-%d")))
    cur.executemany("INSERT INTO lang (id, name, val, val_noexp, res_vac, date_added) VALUES(NULL, ?, ?, ?, ?, ?)", data_prev)
    data_prev = []

con.commit()

