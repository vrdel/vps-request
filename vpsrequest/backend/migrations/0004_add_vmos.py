# Generated by Django 2.2.9 on 2020-02-10 16:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_perm_appr_request'),
    ]

    operations = [
        migrations.CreateModel(
            name='VMOS',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vm_os', models.CharField(max_length=50, verbose_name='VM OS')),
            ],
        ),
    ]
