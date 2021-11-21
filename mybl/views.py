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

def currencies(request):
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
    delta = 7
    delta1 = 365
    delta2 = 1460
    delta3 = 4018

    '''if today == 6:
        delta = 2
    elif today == 0:
        delta = 3'''
    
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
    return render(request, 'mybl/currencies.html', context)

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
    langs = cache.get('langs')
    charts = cache.get('charts')
    charts_march = cache.get('charts_march')
    graphs = cache.get('graphs')
    graphs_avg = cache.get('graphs_avg')
        
    context = {'langs': langs, 'charts': charts, 'charts_march': charts_march, 'graphs': graphs, 'graphs_avg': graphs_avg}
    
    return render(request, 'mybl/hh.html', context)
    
    
def about(request):
    return render(request, 'mybl/about.html')


def index(request):
    chart_tickers = cache.get('chart_tickers_view')
    tickers5000 = cache.get('tickers5000')
        
    context = {'chart_tickers': chart_tickers, 'tickers5000': tickers5000}
            
    return render(request, 'mybl/index.html', context)
