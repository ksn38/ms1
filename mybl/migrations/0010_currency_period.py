# Generated by Django 3.1.2 on 2020-11-02 07:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0009_currency'),
    ]

    operations = [
        migrations.AddField(
            model_name='currency',
            name='period',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]