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
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from mybl.psql_req import chart_langs, langs_today, chart_langs_march
from django.core import serializers


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Lang, Lang_avg, Lang_graphs

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def apivac(expir):
    vac = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        #print(i, val['found'])

    return vac


def parservac0():
    res = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        url = 'https://hh.ru/search/resume?clusters=true&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=position&text=' + i
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
        response = requests.get(url, headers=headers).text
        parsed_html = bs(response, 'lxml')
        bloko = parsed_html.find('h1', {'class': 'bloko-header-1'}).text.split(' ')[-1].split('\xa0')
        if len(bloko) == 3:
            bloko = ''.join(map(str, bloko[:2]))
        else:
            bloko = ''.join(map(str, bloko[:1]))
        res[i] = int(bloko)
        print(i, bloko)
        time.sleep(3)

    return res
    
def parservac():
    res = {'Python': 26734, 'C%23': 15656, 'c%2B%2B': 15369, 'Java': 29399, 'Javascript': 11147, 'php': 15014, 'Ruby': 1147,\
    'Golang': 1665, '1c': 140444, 'Data scientist': 8606, 'Scala': 296, 'iOS': 5768, 'Frontend': 48737, 'DevOps': 6356, 'ABAP': 968, 'Android': 7721}

    return res
    
date_today = date.today().strftime("%Y-%m-%d")
langs = Lang.objects.filter(Q(date_added = date_today))

if len(langs) == 0:
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

cache.set('langs', Lang.objects.raw(langs_today))
cache.set('charts', Lang.objects.raw(chart_langs))
cache.set('charts_march', Lang.objects.raw(chart_langs_march))

graphs = Lang_graphs.objects.raw("""select id, name, val, date_added from mybl_lang ml where name = 'Python' or name = 'Java' or name = 'Javascript' or name = 'php' or name = 'cpp' or name = 'cs' order by date_added, name""")
cache.set('graphs', serializers.serialize('json', graphs))

graphs_avg = Lang_avg.objects.raw("""select distinct max(id) over(partition by date_added) as id, date_added, avg(val_noexp) over(partition by date_added) as avg_vn, avg(res_vac) over(partition by date_added) as avg_rv from mybl_lang order by date_added""")
cache.set('graphs_avg', serializers.serialize('json', graphs_avg))
