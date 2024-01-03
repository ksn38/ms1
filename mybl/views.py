from django.shortcuts import render
from mybl.models import Lang, Ticker#, Bpost, Comment
# from django.http import HttpResponseRedirect, Http404
# from django.urls import reverse
# from mybl.forms import BpostForm, CommentForm
# from django.contrib.auth.decorators import login_required
import requests
from datetime import date
from datetime import timedelta
from collections import OrderedDict
import re
from django.core.cache import cache
from django.conf import settings
from django.core.cache.backends.base import DEFAULT_TIMEOUT
from .psql_req import chart_langs, langs_today, chart_langs_2021, chart_langs_2022, chart_langs_2023, chart_tickers


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

    delta0 = 7
    delta1 = 365
    delta2 = 1460
    delta3 = 4018
    
    if(request.GET.get('mybtn')):
        delta0 = (int(request.GET.get('mytextbox0')))
        delta1 = (int(request.GET.get('mytextbox1')))
        delta2 = (int(request.GET.get('mytextbox2')))
        delta3 = (int(request.GET.get('mytextbox3')))
  
    def ordered_array(delta_val):
        now = parser(0, now=True)
        delta = parser(delta_val, now=False)
        order_dif = {}
        
        for key in now[0].keys():
            if key not in {'BYN', 'HUF', 'KGS', 'MDL', 'TJS', 'UZS', 'HKD', 'AZN', 'AMD', 'TMT', 'CZK', 'DKK', \
            'BGN', 'RON', 'RSD', 'GEL', 'NZD', 'THB', 'VND', 'AED', 'QAR', 'EGP', 'IDR'}:
                try:
                    order_dif[key] = round((now[0][key] / delta[0][key] - 1) * 100, 2)
                except KeyError:
                    pass
        
        order_dif_plus = OrderedDict(sorted(order_dif.items(), key=lambda item: item[1], reverse=True))

        return order_dif_plus.items(), delta[1]
    
    if cache.get('dif_plus0') == None  and delta0 == 7 and delta1 == 365 and delta2 == 1460 and delta3 == 4018:
        for i, j in  enumerate([delta0, delta1, delta2, delta3]):
            cache.set('dif_plus' + str(i), list(ordered_array(j)[0]))
            cache.set('date_delta' + str(i), (ordered_array(j)[1]))

    context = {}

    if cache.get('dif_plus0') != None and delta0 == 7 and delta1 == 365 and delta2 == 1460 and delta3 == 4018:
        for i, j in  enumerate([delta0, delta1, delta2, delta3]):
            context['dif_plus' + str(i)] = cache.get('dif_plus' + str(i))
            context['date_delta' + str(i)] = cache.get('date_delta' + str(i))
            context['delta' + str(i)] = j
    else:
        for i, j in  enumerate([delta0, delta1, delta2, delta3]):
            context['dif_plus' + str(i)] = ordered_array(j)[0]
            context.update({'date_delta' + str(i): ordered_array(j)[1]})
            context['delta' + str(i)] = j

    return render(request, 'mybl/currencies.html', context)

def hh(request):
    langs = Lang.objects.raw(langs_today)
    charts = Lang.objects.raw(chart_langs)
    charts_2023 = Lang.objects.raw(chart_langs_2023)
    charts_2022 = Lang.objects.raw(chart_langs_2022)
    charts_2021 = Lang.objects.raw(chart_langs_2021)
    graphs_val = cache.get('graphs_val')
    graphs_val_noexp = cache.get('graphs_val_noexp')
    graphs_res_vac = cache.get('graphs_res_vac')
    graphs_avg = cache.get('graphs_avg')
        
    context = {'langs': langs, 'charts': charts, 'charts_2021': charts_2021, 'charts_2022': charts_2022, 'charts_2023': charts_2023, \
                'graphs_val': graphs_val, 'graphs_avg': graphs_avg, 'graphs_val_noexp': graphs_val_noexp, 'graphs_res_vac': graphs_res_vac}
    
    return render(request, 'mybl/hh.html', context)
    
def about(request):
    return render(request, 'mybl/about.html')

def index(request):
    tickers5000 = cache.get('tickers5000')
        
    context = {'chart_tickers': Ticker.objects.raw(chart_tickers), 'tickers5000': tickers5000}
            
    return render(request, 'mybl/index.html', context)

'''def blog(request):
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

@login_required
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
    return render(request, 'mybl/edit_bpost.html', context)'''

