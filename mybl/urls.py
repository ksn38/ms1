from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('blog/', views.blog, name='blog'),
    path('bpost/<bpost_id>', views.bpost, name='bpost'),
    path('new_bpost/', views.new_bpost, name='new_bpost'),
    path('edit_bpost/<bpost_id>', views.edit_bpost, name='edit_bpost'),
    path('hh/', views.hh, name='hh'),
    path('indices', views.tickers, name='tickers'),
]
