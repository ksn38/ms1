# Generated by Django 3.1.2 on 2020-12-09 08:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0024_ticker_tnx'),
    ]

    operations = [
        migrations.RenameField(
            model_name='ticker',
            old_name='GSPC',
            new_name='gspc',
        ),
        migrations.RenameField(
            model_name='ticker',
            old_name='TNX',
            new_name='tnx',
        ),
        migrations.RenameField(
            model_name='ticker',
            old_name='VIX',
            new_name='vix',
        ),
    ]
