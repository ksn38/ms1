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
from mybl.psql_req import chart_tickers
from django.core import serializers


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Ticker

CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def ticks(*args):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
    t_dict = OrderedDict()

    for i in (args):
        if i not in {'wti', 'gold', 'sz', 'wheat', 'ss', 'cop'}:
            url = 'https://finance.yahoo.com/quote/^' + i
        else:
            commodities = {'wti': 'CL=F', 'gold': 'GC=F', 'wheat': 'KE=F', 'sz': '399001.SZ', 'ss': '000001.SS', 'cop': 'HG=F'}
            url = 'https://finance.yahoo.com/quote/' + commodities[i]
            
        response = requests.get(url, headers=headers).text
        parsed_html = bs(response, 'lxml')
        t = parsed_html.find('span', {'class': 'Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)'}).text.replace(',', '')
        #print(t)
        t_dict[i] = float(t)

    return t_dict
    
date_today = date.today().strftime("%Y-%m-%d")
date7 = (date.today() - timedelta(7)).strftime("%Y-%m-%d")
tickers = Ticker.objects.filter(Q(date_added = date_today))

if len(tickers) == 0:
    if date.today().weekday() not in {0, 6}:
        t = ticks('gspc')
        if Ticker.objects.filter(Q(date_added__gt= date7)).order_by('-date_added')[0].gspc != t['gspc']:
            t.update(ticks('tnx', 'ixic', 'rut', 'gdaxi', 'ss', 'sz', 'bvsp', 'bsesn', 'wheat', 'wti', 'cop', 'gold', 'vix'))
            t['wheat_gold'] = t['wheat']/t['gold']
            t['wti_gold'] = t['wti']/t['gold']
            t['cop_gold'] = (t['cop']*1000)/t['gold']
            obj = Ticker(**t)
            obj.save()

chart_tickers_raw = Ticker.objects.raw(chart_tickers)
cache.set('chart_tickers_view', chart_tickers_raw)

tickers5000_raw = Ticker.objects.raw("select * from mybl_ticker mt where id > (select max(id) from mybl_ticker mt2) - 5000")
tickers5000_raw = serializers.serialize('json', tickers5000_raw)        
cache.set('tickers5000', tickers5000_raw)
