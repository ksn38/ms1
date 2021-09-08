langs_today = '''select distinct id, name, val, val_noexp, res_vac, 
(row_number() over(order by val desc) + rank() over(order by val_noexp desc) + row_number() over(order by res_vac)) as rate
from mybl_lang ml where ml.date_added = current_date order by rate;'''

chart_langs = '''select distinct b.id, a."name", ((b.val - a.aval)*100/a.aval) as cnd_val, ((b.val_noexp - a.aval_noexp)*100/a.aval_noexp) as cnd_vn, 
((b.res_vac - a.ares_vac)*100/a.ares_vac)::integer as cnd_rv,
(rank() over(order by  ((b.val - a.aval)*100/a.aval) desc) + 
rank() over(order by ((b.val_noexp - a.aval_noexp)*100/a.aval_noexp) desc) + 
rank() over(order by ((b.res_vac - a.ares_vac)*100/a.ares_vac)::integer)) as rate
from mean a
left join  mybl_lang b on a."name"  = b."name" 
where b.date_added = current_date order by rate;'''

chart_langs_march = '''select distinct b.id, a."name", ((b.val - a.aval)*100/a.aval) as cnd_val, ((b.val_noexp - a.aval_noexp)*100/a.aval_noexp) as cnd_vn, 
((b.res_vac - a.ares_vac)*100/a.ares_vac)::integer as cnd_rv,
(rank() over(order by  ((b.val - a.aval)*100/a.aval) desc) + 
rank() over(order by ((b.val_noexp - a.aval_noexp)*100/a.aval_noexp) desc) + 
rank() over(order by ((b.res_vac - a.ares_vac)*100/a.ares_vac)::integer)) as rate
from mean_march a
left join  mybl_lang b on a."name"  = b."name" 
where b.date_added = current_date order by rate;'''

chart_tickers = '''(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 1 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 5
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 20
where mt.id = (select max(mt.id) from mybl_ticker mt))union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 50 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 100 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 250 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 1000 
where mt.id = (select max(mt.id) from mybl_ticker mt))
union
(select mt2.id, 
round((mt.tnx/mt2.tnx - 1) * 10000)/100 as dif_tnx,
round((mt.gspc/mt2.gspc - 1) * 10000)/100 as dif_gspc,
round((mt.ixic/mt2.ixic - 1) * 10000)/100 as dif_ixic,
round((mt.rut/mt2.rut - 1) * 10000)/100 as dif_rut, 
round((mt.gdaxi/mt2.gdaxi - 1) * 10000)/100 as dif_gdaxi,
round((mt.ss/mt2.ss - 1) * 10000)/100 as dif_ss,
round((mt.sz/mt2.sz - 1) * 10000)/100 as dif_sz, 
round((mt.bvsp/mt2.bvsp - 1) * 10000)/100 as dif_bvsp,
round((mt.bsesn/mt2.bsesn - 1) * 10000)/100 as dif_bsesn,
round((mt.wheat/mt2.wheat - 1) * 10000)/100 as dif_wheat, 
round((mt.wti/mt2.wti - 1) * 10000)/100 as dif_wti,
round((mt.cop/mt2.cop - 1) * 10000)/100 as dif_cop,
round((mt.gold/mt2.gold - 1) * 10000)/100 as dif_gold,
round((mt.vix/mt2.vix - 1) * 10000)/100 as dif_vix
from mybl_ticker mt
left join mybl_ticker mt2 on mt2.id = mt.id - 5000 
where mt.id = (select max(mt.id) from mybl_ticker mt))
order by id desc;'''
