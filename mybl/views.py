from django.shortcuts import render
from mybl.models import Bpost, Comment, Lang, Ticker
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


def index(request):
    def parser(dif):
        url = 'http://www.cbr.ru/scripts/XML_daily.asp'
        today = date.today() - timedelta(days=dif)
        dif = today.strftime("?date_req=%d/%m/%Y")
        response = requests.get(url + dif)
        currency = response.content.decode("cp1251").split('>')
        dict_curr = {}

        for i in range(len(currency)):
            if currency[i] == '<CharCode':
                dict_curr[currency[i + 1].split('<')[0]] = float(currency[i + 7].split('<')[0].replace(',', '.')) / float(currency[i + 3].split('<')[0])

        return dict_curr

    now = parser(0)
    
    today = date.today().weekday()
    delta = 1

    if today == 6:
        delta = 2
    elif today == 0:
        delta = 3
    
    if(request.GET.get('mybtn')):
        delta = (int(request.GET.get('mytextbox')))
        
    delta = parser(delta)
    order_dif = {}

    for key in now.keys():
        if key not in {'BYN', 'HUF', 'KGS', 'MDL', 'TJS', 'UZS', 'HKD', 'AZN', 'AMD', 'TMT', 'CZK', 'DKK', 'BGN', 'RON'}:
            try:
                order_dif[key] = round((now[key] / delta[key] - 1) * 100, 2)
            except KeyError:
                pass

    order_dif_plus = OrderedDict(sorted(order_dif.items(), key=lambda item: item[1], reverse=True))
    dif_plus = []

    for i in order_dif_plus.items():
        if i[1] >= 0:
            dif_plus.append(i)

    order_dif_minus = OrderedDict(sorted(order_dif.items(), key=lambda item: item[1]))
    dif_minus = []

    for i in order_dif_minus.items():
        if i[1] < 0:
            dif_minus.append(i)

    context = {'dif_plus': dif_plus, 'dif_minus': dif_minus}
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

        for i in ['Python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'Ruby', 'Go', '1c', 'Data scientist', 'Scala', 'iOS', 'Frontend', 'DevOps', 'ABAP', 'Android']:
            url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
            response = requests.get(url)
            val = json.loads(response.content.decode("utf-8"))
            vac[i] = val['found']

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
        
    charts = Lang.objects.raw(chart_langs)
    context['charts'] = charts
    charts_march = Lang.objects.raw(chart_langs_march)
    context['charts_march'] = charts_march
    #graphs = Lang.objects.filter(Q(name = 'Python') | Q(name = 'c%2B%2B') | Q(name = 'Java') | Q(name = 'Javascript') | Q(name = 'php'))
    graphs = Lang.objects.raw("""select * from mybl_lang ml where name = 'Python' or name = 'Java' or name = 'Javascript' or name = 'php' or name = 'cpp' order by date_added, name""")
    context['graphs'] = serializers.serialize('json', graphs)
    
    return render(request, 'mybl/hh.html', context)


def tickers(request):
    context = {'tickers': tickers}
    tickers1050 = Ticker.objects.raw("select * from mybl_ticker mt where id > (select max(id) from mybl_ticker mt2) - 5000")
    context['chart_tickers'] = Ticker.objects.raw(chart_tickers)#"select * from chart_tickers")
    context['tickers1050'] = serializers.serialize('json', tickers1050)
            
    return render(request, 'mybl/tickers.html', context)
