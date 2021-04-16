import os
import django
from datetime import date
from datetime import timedelta
from collections import OrderedDict
from bs4 import BeautifulSoup as bs
from django.db.models import Q
import requests


if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "blog.settings")
    django.setup()
    from mybl.models import Ticker


def ticks(*args):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
    t_dict = OrderedDict()

    for i in (args):
        if i not in {'wti', 'gold'}:
            url = 'https://finance.yahoo.com/quote/^' + i
        else:
            commodities = {'wti': 'CL=F', 'gold': 'GC=F'}
            url = 'https://finance.yahoo.com/quote/' + commodities[i]
            
        response = requests.get(url, headers=headers).text
        parsed_html = bs(response, 'lxml')
        t = parsed_html.find('span', {'data-reactid': '32'}).text.replace(',', '')
        t_dict[i] = float(t)

    return t_dict
    
date_today = date.today().strftime("%Y-%m-%d")
date7 = (date.today() - timedelta(7)).strftime("%Y-%m-%d")
tickers = Ticker.objects.filter(Q(date_added = date_today))

if len(tickers) == 0:
    if date.today().weekday() not in {0, 6}:
        t = ticks('gspc')
        if Ticker.objects.filter(Q(date_added__gt= date7)).order_by('-date_added')[0].gspc != t['gspc']:
            t.update(ticks('vix', 'tnx', 'ixic', 'rut', 'wti', 'gold'))
            obj = Ticker(**t)
            obj.save()
