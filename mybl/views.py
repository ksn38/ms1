from django.shortcuts import render
from mybl.models import Bpost, Comment, Lang
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
    def proportions(expir):
        vac = {}

        for i in ['python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'ruby', 'go', '1c', 'Data scientist', 'Scala']:
            url = 'https://api.hh.ru/vacancies?&' + expir + 'search_field=name&text=' + i
            #url = 'https://api.hh.ru/vacancies?&search_field=name&text=' + i
            response = requests.get(url)
            val = json.loads(response.content.decode("utf-8"))
            vac[i] = val['found']

        res = {}

        for i in ['python', 'C%23', 'c%2B%2B', 'Java', 'Javascript', 'php', 'ruby', 'go', '1c', 'Data scientist', 'Scala']:
            # url = 'https://hh.ru/search/resume?clusters=true&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=position&text=' + i
            url = 'https://hh.ru/search/resume?clusters=true&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=position&' + expir + 'text=' + i
            headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'}
            response = requests.get(url, headers=headers).text
            parsed_html = bs(response, 'lxml')
            bloko = parsed_html.find('h1', {'class': 'bloko-header-1'}).text.split(' ')[-1].split('\xa0')
            if len(bloko) == 3:
                bloko = ''.join(map(str, bloko[:2]))
            else:
                bloko = ''.join(map(str, bloko[:1]))
            res[i] = int(bloko)

        langs = {}

        for i in vac.keys():
            langs[i] = round(res[i]/vac[i])

        return langs

    noexp = 'experience=noExperience&'
    #print(proportions(''))
    #print(proportions(noexp))
    date_today = date.today().strftime("%Y-%m-%d")
    langs = Lang.objects.extra(where=["date_added='" + date_today + "'"])
    
    if len(langs) == 0:
        dict_langs = proportions('')
        for k, v, in dict_langs.items():
            new_values = {'name': k,
             'val': v, 'val_noexp': 0}
            obj = Lang(**new_values)
            obj.save()
        
        langs = Lang.objects.extra(where=["date_added='" + date_today + "'", "val_noexp=0"])
        context = {'langs': langs}
    elif len(langs) == 11:
        dict_langs_noexp = proportions(noexp)
        for k, v, in dict_langs_noexp.items():
            new_values = {'name': k,
             'val': v, 'val_noexp': 1}
            obj = Lang(**new_values)
            obj.save()
        langs = Lang.objects.extra(where=["date_added='" + date_today + "'", "val_noexp=0"])
        langs_noexp = Lang.objects.extra(where=["date_added='" + date_today + "'", "val_noexp=1"])
        context = {'langs': langs, 'langs_noexp': langs_noexp}
    else:
        langs = Lang.objects.extra(where=["date_added='" + date_today + "'", "val_noexp=0"])
        langs_noexp = Lang.objects.extra(where=["date_added='" + date_today + "'", "val_noexp=1"])
        context = {'langs': langs, 'langs_noexp': langs_noexp}
        
    return render(request, 'mybl/hh.html', context)
