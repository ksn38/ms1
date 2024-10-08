sudo apt-get install postgresql postgresql-server-dev-all  
sudo -u postgres psql postgres  
\password postgres  

create user <user> with password 'password';  
alter role <user> set client_encoding to 'utf8';  
alter role <user> set default_transaction_isolation to 'read committed';  
alter role <user> set timezone to 'UTC';  

create database <database> owner <user>;  

DATABASES = {  
&emsp;'default': {  
&emsp;&emsp;'ENGINE': 'django.db.backends.postgresql',  
&emsp;&emsp;'NAME': 'mydatabase',  
&emsp;&emsp;'USER': 'mydatabaseuser',  
&emsp;&emsp;'PASSWORD': 'mypassword',  
&emsp;&emsp;'HOST': '127.0.0.1',  
&emsp;&emsp;'PORT': '5432',  
&emsp;}  
}  

pg_restore -d <database> latest.dump  
pg_dump <database> > latest.dump

pip3 install -r requirements.txt  
nohup python3 manage.py runserver 0.0.0.0:8000 &  

ALTER SEQUENCE mybl_tickers_id_seq RESTART WITH 1;  
UPDATE mybl_ticker SET id=nextval('mybl_tickers_id_seq');  

\copy (select * from mybl_lang) to '/tmp/mybl_lang.csv' with csv header  

sudo apt-get install redis-server  
pip3 install django-redis  
sudo redis-server  
