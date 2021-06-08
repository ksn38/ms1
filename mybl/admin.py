from django.contrib import admin
from mybl.models import Bpost, Comment, Lang, Ticker, Lang_avg

admin.site.register(Bpost)
admin.site.register(Comment)
admin.site.register(Lang)
admin.site.register(Lang_avg)
admin.site.register(Ticker)
