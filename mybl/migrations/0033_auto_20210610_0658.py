# Generated by Django 3.0.1 on 2021-06-10 06:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mybl', '0032_auto_20210610_0656'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Lang_graph',
            new_name='Lang_graphs',
        ),
        migrations.AlterField(
            model_name='comment',
            name='bpost',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='mybl.Bpost'),
        ),
    ]
