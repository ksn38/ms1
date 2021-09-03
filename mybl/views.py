from django.shortcuts import render
from mybl.models import Bpost, Comment, Lang, Ticker, Lang_avg, Lang_graphs
from django.http import HttpResponseRedirect, Http404
from django.urls import reverse
from mybl.forms import BpostForm, CommentForm
from django.contrib.auth.decorators import login_required
import requests
from datetime import date
from datetime import timedelta
from collections import OrderedDict
import json
from bs4 import BeautifulSoup as bs
from django.core import serializers
from django.db.models import Q
from mybl.psql_req import chart_langs, chart_tickers, langs_today, chart_langs_march
import re
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT


CACHE_TTL = getattr(settings, 'CACHE_TTL', DEFAULT_TIMEOUT)

def index(request):
    def parser(dif, now):
        url = 'http://www.cbr.ru/scripts/XML_daily.asp'
        today = date.today() - timedelta(days=dif)
        dif = today.strftime("?date_req=%d/%m/%Y")
        response = requests.get(url + dif)
        currency = response.content.decode("cp1251").split('>')
        dict_curr = {}
        date_delta = currency[1]

        if now != True:
            date_delta = re.sub('[^0-9.]', '', date_delta)

        for i in range(len(currency)):
            if currency[i] == '<CharCode':
                dict_curr[currency[i + 1].split('<')[0]] = float(currency[i + 7].split('<')[0].replace(',', '.')) / float(currency[i + 3].split('<')[0])

        return dict_curr, date_delta

    today = date.today().weekday()
    delta = 1
    delta1 = 100
    delta2 = 1000
    delta3 = 4000

    if today == 6:
        delta = 2
    elif today == 0:
        delta = 3
    
    if(request.GET.get('mybtn')):
        delta = (int(request.GET.get('mytextbox')))
        delta1 = (int(request.GET.get('mytextbox1')))
        delta2 = (int(request.GET.get('mytextbox2')))
        delta3 = (int(request.GET.get('mytextbox3')))
  
    def ordered_array(delta_val):
        now = parser(0, now=True)
        delta = parser(delta_val, now=False)
        order_dif = {}
        
        for key in now[0].keys():
            if key not in {'BYN', 'HUF', 'KGS', 'MDL', 'TJS', 'UZS', 'HKD', 'AZN', 'AMD', 'TMT', 'CZK', 'DKK', 'BGN', 'RON'}:
                try:
                    order_dif[key] = round((now[0][key] / delta[0][key] - 1) * 100, 2)
                except KeyError:
                    pass
        
        order_dif_plus = OrderedDict(sorted(order_dif.items(), key=lambda item: item[1], reverse=True))

        return order_dif_plus.items(), delta[1]

    context = {'dif_plus': ordered_array(delta)[0], 'date_delta': ordered_array(delta)[1], 'delta': delta,\
                'dif_plus1': ordered_array(delta1)[0], 'date_delta1': ordered_array(delta1)[1], 'delta1': delta1,\
                'dif_plus2': ordered_array(delta2)[0], 'date_delta2': ordered_array(delta2)[1], 'delta2': delta2,\
                'dif_plus3': ordered_array(delta3)[0], 'date_delta3': ordered_array(delta3)[1], 'delta3': delta3}
    return render(request, 'mybl/index.html', context)

def blog(request):
    blog = Bpost.objects.order_by('date_added')
    context = {'blog': blog}
    return render(request, 'mybl/blog.html', context)

def bpost(request, bpost_id):
    bpost = Bpost.objects.get(id=bpost_id)
    comments = bpost.comment_set.order_by('-date_added')
    if request.method != 'POST':
        form = CommentForm()
    else:
        form = CommentForm(data=request.POST)
        if form.is_valid():
            new_comment = form.save(commit=False)
            new_comment.bpost = bpost
            new_comment.save()
            return HttpResponseRedirect(reverse('bpost', args=[bpost_id]))
            
    context = {'bpost': bpost, 'comments': comments, 'form': form}
    return render(request, 'mybl/bpost.html', context)

@login_required
def new_bpost(request):
    if request.method != 'POST':
        form = BpostForm()
    else:
        form = BpostForm(request.POST)
        if form.is_valid():
            new_bpost = form.save(commit=False)
            new_bpost.owner = request.user
            new_bpost.save()
            return HttpResponseRedirect(reverse('blog'))
            
    context = {'form': form}
    return render(request, 'mybl/new_bpost.html', context)

'''@login_required
def new_comment(request, bpost_id):
    bpost = Bpost.objects.get(id=bpost_id)
    
    if request.method != 'POST':
        form = CommentForm()
    else:
        form = CommentForm(data=request.POST)
        if form.is_valid():
            new_comment = form.save(commit=False)
            new_comment.bpost = bpost
            new_comment.save()
            return HttpResponseRedirect(reverse('bpost', args=[bpost_id]))
            
    context = {'bpost': bpost, 'form': form}
    return render(request, 'mybl/new_comment.html', context)
    
'''
    
@login_required
def edit_bpost(request, bpost_id):
    bpost = Bpost.objects.get(id=bpost_id)
    if bpost.owner != request.user:
        raise Http404
    
    if request.method != 'POST':
        form = BpostForm(instance=bpost)
    else:
        form = BpostForm(instance=bpost, data=request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('bpost', args=[bpost.id]))
            
    context = {'bpost': bpost, 'form': form}
    return render(request, 'mybl/edit_bpost.html', context)
    
def hh(request):
    def apivac(expir):
        vac = {}

        for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Golang', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
            url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
            response = requests.get(url)
            val = json.loads(response.content.decode("utf-8"))
            vac[i] = val['found']

        return vac


    def parservac():
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
            new_values = {'name': k,
             'val': v, 'val_noexp': vne, 'res_vac': vrv}
            obj = Lang(**new_values)
            obj.save()
        
        langs = Lang.objects.raw(langs_today)
        context = {'langs': langs}
    else:
        langs = Lang.objects.raw(langs_today)
        context = {'langs': langs}
        
    context['charts'] = Lang.objects.raw(chart_langs)
    context['charts_march'] = Lang.objects.raw(chart_langs_march)
    #graphs = Lang.objects.filter(Q(name = 'Python') | Q(name = 'c%2B%2B') | Q(name = 'Java') | Q(name = 'Javascript') | Q(name = 'php'))

    graphs = Lang_graphs.objects.raw("""select id, name, res_vac, date_added from mybl_lang ml where name = 'Python' or name = 'Java' or name = 'Javascript' or name = 'php' or name = 'cpp' order by date_added, name""")
    context['graphs'] = serializers.serialize('json', graphs)

    graphs_avg = Lang_avg.objects.raw("""select distinct max(id) over(partition by date_added) as id, date_added, avg(val_noexp) over(partition by date_added) as avg_vn, avg(res_vac) over(partition by date_added) as avg_rv from mybl_lang order by date_added""")
    context['graphs_avg'] = serializers.serialize('json', graphs_avg)

    graphs_mean_today = Lang.objects.raw(chart_langs)
    context['graphs_mean_today'] = serializers.serialize('json', graphs_mean_today)
    graphs_mean_change = Lang.objects.raw(chart_langs_march)
    context['graphs_mean_change'] = serializers.serialize('json', graphs_mean_change)
    
    return render(request, 'mybl/hh.html', context)


'''def tickers(request):
    context = {'tickers': tickers}
    tickers5000 = Ticker.objects.raw("select * from mybl_ticker mt where id > (select max(id) from mybl_ticker mt2) - 5000")
    context['chart_tickers'] = Ticker.objects.raw(chart_tickers)#"select * from chart_tickers")
    context['tickers5000'] = serializers.serialize('json', tickers5000)
            
    return render(request, 'mybl/tickers.html', context)'''
    
    
def about(request):
    return render(request, 'mybl/about.html')
    

'''def tickers(request):
    if 'chart_tickers_view' in cache:
        chart_tickers_view = cache.get('chart_tickers_view')
    else:
        chart_tickers_raw = Ticker.objects.raw(chart_tickers)#"select * from chart_tickers")
        cache.set('chart_tickers_view', chart_tickers_raw)
        chart_tickers_view = cache.get('chart_tickers_view')
    
    if 'tickers5000' in cache:
        tickers5000 = cache.get('tickers5000')
    else:
        tickers5000_raw = Ticker.objects.raw("select * from mybl_ticker mt where id > (select max(id) from mybl_ticker mt2) - 5000")
        tickers5000_raw = serializers.serialize('json', tickers5000_raw)        
        cache.set('tickers5000', tickers5000_raw)
        tickers5000 = cache.get('tickers5000')
        
    context = {'chart_tickers': chart_tickers_view, 'tickers5000': tickers5000}
            
    return render(request, 'mybl/tickers.html', context)'''


def tickers(request):
    chart_tickers = cache.get('chart_tickers_view')
    tickers5000 = cache.get('tickers5000')
        
    context = {'chart_tickers': chart_tickers, 'tickers5000': tickers5000}
            
    return render(request, 'mybl/tickers.html', context)
