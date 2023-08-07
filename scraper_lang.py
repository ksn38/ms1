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
from mybl.psql_req import chart_langs, langs_today, chart_langs_march
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
        if i == 'Android': #or i == 'iOS':
            url = 'https://api.hh.ru/vacancies?&' + expir + 'industry=43&industry=7&industry=11&search_field=name&text=' + i
        else:
            url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        #print(i, val['found'])
        time.sleep(1)

    return vac
    
def parservac():
    res = {'Python': 35470, 'C%23': 16693, 'c%2B%2B': 16595, 'Java': 32641, 'Javascript': 11631, 'php': 15137, 'Ruby': 1192,\
    'Golang': 3036, '1c': 154558, 'Data scientist': 11212, 'Scala': 300, 'iOS': 6960, 'Frontend': 60188, 'DevOps': 9030, 'ABAP': 1009, 'Android': 9303}

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
        if k == 'Android':
            v = round(v * 1.3)
            rv = round(rv / 1.3)
        new_values = {'name': k,
         'val': v, 'val_noexp': vne, 'res_vac': rv}
        obj = Lang(**new_values)
        obj.save()

if len(langs) == 0:
    try:
        get_and_write()
    except KeyError:
        time.sleep(1800)
        get_and_write()

cache.set('langs', Lang.objects.raw(langs_today))
cache.set('charts', Lang.objects.raw(chart_langs))
cache.set('charts_march', Lang.objects.raw(chart_langs_march))

def pivot_and_set_in_cache(sql_req, column, period):
    df_langs = [i['fields'] for i in serializers.serialize('python', sql_req)]
    graphs = pd.DataFrame(df_langs).pivot(index='date_added', columns='name', values=column)
    graphs = graphs.fillna(0)
    graphs = graphs.sort_index(ascending=False)
    graphs_short = pd.DataFrame(columns=graphs.columns)
    for i in range(len(graphs))[::period]:
        graphs_short.loc[graphs.index[i]] = graphs[i:i+period].mean()
    graphs_short = graphs_short.sort_index(ascending=True)
    graphs_short['date_added'] = graphs_short.index
    graphs_short['date_added'] = graphs_short['date_added'].astype('str')
    cache.set('graphs_' + column, graphs_short.to_dict(orient='list'))

val = Lang.objects.raw("""select id, name, val, date_added from mybl_lang ml order by date_added, name""")
val_noexp = Lang.objects.raw("""select id, name, val_noexp, date_added from mybl_lang ml order by date_added, name""")
res_vac = Lang.objects.raw("""select id, name, res_vac, date_added from mybl_lang ml order by date_added, name""")
pivot_and_set_in_cache(val, 'val', 7)
pivot_and_set_in_cache(val_noexp, 'val_noexp', 56)
pivot_and_set_in_cache(res_vac, 'res_vac', 28)

graphs_avg = Lang_avg.objects.raw("""select distinct max(id) over(partition by date_added) as id, date_added, avg(val_noexp) over(partition by date_added) as avg_vn, avg(res_vac) over(partition by date_added) as avg_rv from mybl_lang order by date_added""")
cache.set('graphs_avg', serializers.serialize('json', graphs_avg))
