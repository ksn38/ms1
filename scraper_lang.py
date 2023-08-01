import os
import django
from datetime import date
from datetime import timedelta
from collections import OrderedDict
from bs4 import BeautifulSoup as bs
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
    from mybl.models import Lang, Lang_avg, Lang_graphs

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def apivac(expir):
    vac = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        if i == 'iOS' or i == 'Android':
            url = 'https://api.hh.ru/vacancies?&' + expir + 'industry=43&industry=7&industry=11&search_field=name&text=' + i
        else:
            url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        #print(i, val['found'])

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

    for k, v, vne, vrv in zip(vacs.keys(), vacs.values(), vacs_noexp.values(), res.values()):
        if k == 'c%2B%2B':
            k = 'cpp'
        if k == 'C%23':
            k = 'cs'
        new_values = {'name': k,
         'val': v, 'val_noexp': vne, 'res_vac': vrv}
        obj = Lang(**new_values)
        obj.save()

if len(langs) == 0:
    try:
        get_and_write()
    except KeyError:
        time.sleep(900)
        get_and_write()

cache.set('langs', Lang.objects.raw(langs_today))
cache.set('charts', Lang.objects.raw(chart_langs))
cache.set('charts_march', Lang.objects.raw(chart_langs_march))

graphs = Lang_graphs.objects.raw("""select id, name, val, date_added from mybl_lang ml
                                  order by date_added, name""")

df_langs = [i['fields'] for i in serializers.serialize('python', graphs)]
graphs = pd.DataFrame(df_langs).pivot(index='date_added', columns='name', values='val')
graphs = graphs.fillna(0)
graphs = graphs.sort_index(ascending=False)
graphs7 = pd.DataFrame(columns=graphs.columns)
for i in range(len(graphs))[::7]:
    graphs7.loc[graphs.index[i]] = graphs[i:i+7].mean()
graphs7 = graphs7.sort_index(ascending=True)
graphs7['date_added'] = graphs7.index
graphs7['date_added'] = graphs7['date_added'].astype('str')
#print(graphs7.columns)
cache.set('graphs', graphs7.to_dict(orient='list'))

graphs_avg = Lang_avg.objects.raw("""select distinct max(id) over(partition by date_added) as id, date_added, avg(val_noexp) over(partition by date_added) as avg_vn, avg(res_vac) over(partition by date_added) as avg_rv from mybl_lang order by date_added""")
cache.set('graphs_avg', serializers.serialize('json', graphs_avg))
