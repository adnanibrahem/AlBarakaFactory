# Generated by Django 3.2 on 2025-06-23 16:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Agents', '0009_auto_20250620_2220'),
        ('Box', '0010_auto_20250622_1714'),
    ]

    operations = [
        migrations.AddField(
            model_name='boxtransaction',
            name='destination',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='Agents.destination'),
        ),
    ]
