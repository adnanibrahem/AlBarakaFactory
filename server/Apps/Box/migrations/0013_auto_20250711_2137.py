# Generated by Django 3.2 on 2025-07-11 18:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Box', '0012_auto_20250628_1153'),
    ]

    operations = [
        migrations.AlterField(
            model_name='boxtransaction',
            name='fromOther',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='boxtransaction',
            name='toOther',
            field=models.BooleanField(default=False),
        ),
    ]
