# Generated by Django 3.2.7 on 2021-09-08 09:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0040_auto_20210722_1535'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticker',
            name='cop',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ticker',
            name='cop_gold',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ticker',
            name='wheat_gold',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ticker',
            name='wti_gold',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
