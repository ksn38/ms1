import os
import django
from datetime import date
from datetime import timedelta
from collections import OrderedDict
from bs4 import BeautifulSoup as bs
from django.db.models import Q
import requests
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.core import serializers
import time
import re


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Ticker

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

urli = 'https://finance.yahoo.com/markets/world-indices/'
urlt = 'https://finance.yahoo.com/markets/bonds/'
regi = '\" data-field=\"regularMarketPrice\" data-trend=\"none\" data-pricehint=\"2\" data-value=\"\d*\.\d*\" active'
regt = '\" data-field=\"regularMarketPrice\" data-trend=\"none\" data-pricehint=\"4\" data-value=\"\d*\.\d*\" active'
        
def ticks(url, reg, *args):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
    
    d = dict()
    response = requests.get(url, headers=headers).text

    for i in (args):
        x = re.findall(i + reg, response)
        if i != '000001.SS':
            d[str.lower(i)] = float(re.findall('\d+\.\d+', str(x))[0])
        else:
            d['ss'] = float(re.findall('\d+\.\d+', str(x))[0])

    return d

def trec():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
    d = dict()
    
    response = requests.get('https://tradingeconomics.com/commodities', headers=headers).text
    parsed_html = bs(response, 'lxml')
    
    for i in ('CL1:COM', 'W 1:COM', 'HG1:COM', 'XAUUSD:CUR'):
        t = parsed_html.find('tr', {'data-symbol': i}).text
        t = ' '.join(t.split())
        name = re.findall('^\w+', t)
        val = re.findall('\d+\.\d+', t)[0]
        if name[0] != 'Crude':
            d[str.lower(name[0])] = float(val)
        else:
            d['wti'] = float(val)

    return d
    
date_today = date.today().strftime("%Y-%m-%d")
#date_today_2 = date.today().strftime("%b %d, %Y")
date7 = (date.today() - timedelta(14)).strftime("%Y-%m-%d")
tickers = Ticker.objects.filter(Q(date_added = date_today))

if len(tickers) == 0:
    if date.today().weekday() not in {0, 6}:
        t = ticks(urli, regi, 'GSPC', 'IXIC', 'RUT', 'VIX', 'GDAXI', 'BVSP', '000001.SS', 'BSESN')
        if Ticker.objects.filter(Q(date_added__gt= date7)).order_by('-date_added')[0].gspc != t['gspc']:
            t.update(ticks(urlt, regt, 'TNX'))
            t.update(trec())
            t['wheat_gold'] = t['wheat']/t['gold']
            t['wti_gold'] = t['wti']/t['gold']
            t['copper_gold'] = (t['copper']*1000)/t['gold']
            obj = Ticker(**t)
            obj.save()

tickers5000_raw = Ticker.objects.raw("select * from mybl_ticker mt where id > (select max(id) from mybl_ticker mt2) - 5000")
tickers5000_raw = serializers.serialize('json', tickers5000_raw)        
cache.set('tickers5000', tickers5000_raw)

cache.delete('dif_plus0')
