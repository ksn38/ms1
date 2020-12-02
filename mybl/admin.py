from django.contrib import admin
from mybl.models import Bpost, Comment, Lang, Ticker

admin.site.register(Bpost)
admin.site.register(Comment)
admin.site.register(Lang)
admin.site.register(Ticker)
