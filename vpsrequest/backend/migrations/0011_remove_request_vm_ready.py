# Generated by Django 2.2.12 on 2020-04-22 15:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_allow_null_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='request',
            name='vm_ready',
        ),
    ]