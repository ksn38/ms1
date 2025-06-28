sudo apt-get install postgresql postgresql-server-dev-all  
sudo -u postgres psql postgres  
\password postgres  

create user *user* with password *'password'*;  
alter role *user* set client_encoding to 'utf8';  
alter role *user* set default_transaction_isolation to 'read committed';  
alter role *user* set timezone to 'UTC';  

create database *database* owner *user*;  

DATABASES = {  
&emsp;'default': {  
&emsp;&emsp;'ENGINE': 'django.db.backends.postgresql',  
&emsp;&emsp;'NAME': *database*,  
&emsp;&emsp;'USER': *user*,  
&emsp;&emsp;'PASSWORD': *password*,  
&emsp;&emsp;'HOST': '127.0.0.1',  
&emsp;&emsp;'PORT': '5432',  
&emsp;}  
}  

pg_dump *database* > latest.dump  
psql *database* < latest.dump

pip3 install -r requirements.txt --break-system-packages  
nohup python3 manage.py runserver 0.0.0.0:8000 &  

ALTER SEQUENCE mybl_tickers_id_seq RESTART WITH 1;  
UPDATE mybl_ticker SET id=nextval('mybl_tickers_id_seq');  

\copy (select * from mybl_lang) to '/tmp/mybl_lang.csv' with csv header  

sudo apt-get install redis-server  
pip3 install django-redis  
sudo redis-server  


drop table if exists mean;  
create table mean (  
name varchar,  
aval int,  
aval_noexp int,  
ares_vac numeric(9, 2)  
);

insert into mean  
select distinct name, avg(val) as aval, avg(val_noexp) as aval_noexp, avg(res_vac) as ares_vac from mybl_lang ml 
where date_added between '2020-11-20' and '2020-12-31' group by name;
