# Generated by Django 3.2.7 on 2021-09-08 09:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0041_auto_20210908_0934'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticker',
            name='cop_gold',
        ),
        migrations.RemoveField(
            model_name='ticker',
            name='wheat_gold',
        ),
        migrations.RemoveField(
            model_name='ticker',
            name='wti_gold',
        ),
    ]
