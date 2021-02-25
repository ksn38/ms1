chart_langs = '''select distinct b.id, a."name", ((b.val - a.aval)*100/a.aval) as cnd_val, ((b.val_noexp - a.aval_noexp)*100/a.aval_noexp) as cnd_vn, 
((b.res_vac - a.ares_vac)*100/a.ares_vac)::integer as cnd_rv 
from mean a
left join  mybl_lang b on a."name"  = b."name" 
where b.date_added = current_date order by cnd_rv;'''

chart_tickers = '''(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 1 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 20
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 50 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 100 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 250 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 1000 
where mt.id = (select max(mt.id) from mybl_ticker mt))
order by id desc;'''
