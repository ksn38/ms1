import os
import django
from datetime import date
from django.db.models import Q
import requests
import json
import time
import pandas as pd
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.core import serializers
import json


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Lang, Lang_avg


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def apivac(expir):
    vac = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i + '+not+%D0%BF%D1%80%D0%B5%D0%BF%D0%BE%D0%B4%D0%B0%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C+not+%D0%BA%D1%83%D1%80%D1%8C%D0%B5%D1%80'
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        #print(i, val['found'])
        time.sleep(1)

    return vac
    
def parservac():
    res = {'Python': 46414, 'C%23': 19788, 'c%2B%2B': 22119, 'Java': 42684, 'Javascript': 14527, 'php': 19416, 'Ruby': 1445,\
    'Golang': 5275, '1c': 179802, 'Data scientist': 13787, 'Scala': 364, 'iOS': 8539, 'Frontend': 78112, 'DevOps': 13991, 'ABAP': 1138, 'Android': 11341}

    return res
    
date_today = date.today().strftime("%Y-%m-%d")
langs = Lang.objects.filter(Q(date_added = date_today))

def get_and_write():
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
        new_values = {'name': k,
         'val': v, 'val_noexp': vne, 'res_vac': rv}
        obj = Lang(**new_values)
        obj.save()

if len(langs) == 0:
    try:
        get_and_write()
    except KeyError:
        time.sleep(3600)
        get_and_write()

def pivot_and_set_in_cache(sql_req, column, period):
    df_langs = [i['fields'] for i in serializers.serialize('python', Lang.objects.raw(sql_req))]
    graphs = pd.DataFrame(df_langs).pivot(index='date_added', columns='name', values=column)
    graphs = graphs.sort_index(ascending=False)
    graphs_average = pd.DataFrame(columns=graphs.columns)
    for i in range(len(graphs))[::period]:
        graphs_average.loc[graphs.index[i]] = graphs[i:i+period].mean()
    graphs_average = graphs_average.fillna(0)
    graphs_average = graphs_average.sort_index(ascending=True)
    graphs_average['date_added'] = graphs_average.index
    graphs_average['date_added'] = graphs_average['date_added'].astype('str')
    cache.set('graphs_' + column, graphs_average.to_dict(orient='list'))

t1 = time.time()

val = """select id, name, val, date_added from mybl_lang ml order by date_added, name"""
val_noexp = """select id, name, val_noexp, date_added from mybl_lang ml order by date_added, name"""
res_vac = """select id, name, res_vac, date_added from mybl_lang ml order by date_added, name"""
pivot_and_set_in_cache(val, 'val', 7)
pivot_and_set_in_cache(val_noexp, 'val_noexp', 125)
pivot_and_set_in_cache(res_vac, 'res_vac', 77)

#print("time:", time.time() - t1)

graphs_avg = Lang_avg.objects.raw("""select distinct max(id) over(partition by date_added) as id, date_added, avg(val_noexp) over(partition by date_added) as avg_vn, avg(res_vac) over(partition by date_added) as avg_rv from mybl_lang order by date_added""")
cache.set('graphs_avg', serializers.serialize('json', graphs_avg))
