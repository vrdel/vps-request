# Generated by Django 2.2.12 on 2020-06-15 11:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0012_remove_request_vm_host'),
    ]

    operations = [
        migrations.AlterField(
            model_name='request',
            name='vm_remark',
            field=models.TextField(blank=True, null=True),
        ),
    ]
