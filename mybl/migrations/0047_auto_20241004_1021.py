# Generated by Django 3.1.2 on 2024-10-04 10:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0046_auto_20241004_1016'),
    ]

    operations = [
        migrations.RenameField(
            model_name='ticker',
            old_name='cop_gold',
            new_name='copper_gold',
        ),
    ]