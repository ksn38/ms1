from django.shortcuts import render
from mybl.models import Bpost, Comment, Currency
from django.http import HttpResponseRedirect, Http404
from django.urls import reverse
from mybl.forms import BpostForm, CommentForm
from django.contrib.auth.decorators import login_required
import requests


def index(request):
    response = requests.get('http://www.cbr.ru/scripts/XML_daily.asp')
    currency = response.content
    currency = currency.decode("cp1251").split('>')
    dict_curr = {}

    for i in range(len(currency)):
        if currency[i] == '<Name':
            dict_curr[currency[i + 1].split('<')[0]] = float(currency[i + 3].split('<')[0].replace(',', '.'))
            
    context = {'dict_curr': dict_curr}
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
