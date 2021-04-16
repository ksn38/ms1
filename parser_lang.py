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


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Lang


def apivac(expir):
    vac = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Go', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
        url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
        response = requests.get(url)
        val = json.loads(response.content.decode("utf-8"))
        vac[i] = val['found']
        print(i, val['found'])
        time.sleep(10)

    return vac


def parservac():
    res = {}

    for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Go', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
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

    return res

date_today = date.today().strftime("%Y-%m-%d")
langs = Lang.objects.filter(Q(date_added = date_today))

if len(langs) == 0:
    noexp = 'experience=noExperience&'
    vacs = apivac('')
    #time.sleep(600)
    vacs_noexp = apivac(noexp)
    #time.sleep(600)
    res = parservac()

    for k, k2 in zip(vacs.keys(), res.keys()):
        res[k2] = round(res[k2] / vacs[k], 1)
        vacs_noexp[k] = round(vacs_noexp[k] * 100 / vacs[k])

    for k, v, vne, vrv in zip(vacs.keys(), vacs.values(), vacs_noexp.values(), res.values()):
        if k == 'c%2B%2B':
            k = 'cpp'
        new_values = {'name': k,
         'val': v, 'val_noexp': vne, 'res_vac': vrv}
        obj = Lang(**new_values)
        obj.save()


'''def hh(request):
    langs = Lang.objects.raw(langs_today)
    context = {'langs': langs}
    charts = Lang.objects.raw(chart_langs)
    context['charts'] = charts
    charts_march = Lang.objects.raw(chart_langs_march)
    context['charts_march'] = charts_march
    #graphs = Lang.objects.filter(Q(name = 'Python') | Q(name = 'c%2B%2B') | Q(name = 'Java') | Q(name = 'Javascript') | Q(name = 'php'))
    graphs = Lang.objects.raw("""select * from mybl_lang ml where name = 'Python' or name = 'Java' or name = 'Javascript' or name = 'php' or name = 'cpp' order by date_added, name""")
    context['graphs'] = serializers.serialize('json', graphs)
    
    return render(request, 'mybl/hh.html', context)'''
