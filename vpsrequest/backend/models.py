from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    aaieduhr = models.CharField(
        'hrEduPersonUniqueID',
        max_length=30,
        blank=True,
        null=True,
    )
    institution = models.CharField(
        'Institution',
        max_length=200,
        blank=True,
        null=True
    )
    role = models.CharField(
        'Role',
        max_length=100,
        blank=True,
        null=True
    )


class Request(models.Model):
    class Meta:
        permissions = (
            ("approve_request", "Can approve request"),
        )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField('Request update')
    location = models.CharField(
        'Location',
        max_length=200,
        blank=True,
        null=True
    )
    request_date = models.DateTimeField('Request asked')
    head_firstname = models.CharField(
        'Head Firstname',
        max_length=50,
        blank=False,
        null=False
    )
    head_lastname = models.CharField(
        'Head Lastname',
        max_length=50,
        blank=False,
        null=False
    )
    head_institution = models.CharField(
        'Head Institution',
        max_length=200,
        blank=False,
        null=False
    )
    head_role = models.CharField(
        'Head Role',
        max_length=100,
        blank=False,
        null=False
    )
    head_email = models.CharField(
        'Head Email',
        max_length=100,
        blank=False,
        null=False
    )
    vm_purpose = models.TextField(blank=False, null=False)
    vm_os = models.CharField(
        'VM OS',
        max_length=50,
        blank=False,
        null=False
    )
    vm_remark = models.TextField(blank=False, null=False)
    vm_fqdn = models.CharField(
        'VM FQDN',
        max_length=50,
        blank=False,
        null=False
    )
    vm_reason = models.TextField(blank=False, null=False)
    vm_host = models.CharField(
        'VM Host',
        max_length=50,
        blank=False,
        null=False
    )
    vm_ip = models.CharField(
        'VM IP address',
        max_length=16,
        blank=False,
        null=False
    )
    vm_ready = models.IntegerField('VM Ready', blank=False, null=False)
    vm_dismissed = models.DateTimeField('VM Dismissed')
    sys_firstname = models.CharField(
        'Sys Firstname',
        max_length=50,
        blank=False,
        null=False
    )
    sys_lastname = models.CharField(
        'Sys Lastname',
        max_length=50,
        blank=False,
        null=False
    )
    sys_institution = models.CharField(
        'Sys Institution',
        max_length=200,
        blank=False,
        null=False
    )
    sys_role = models.CharField(
        'Sys Role',
        max_length=100,
        blank=False,
        null=False
    )
    sys_email = models.CharField(
        'Sys Email',
        max_length=100,
        blank=False,
        null=False
    )
    approved = models.IntegerField('Request Approved', blank=False, null=False)
    approvedby = models.CharField(
        'Request Approved by',
        max_length=100,
        blank=False,
        null=False
    )
    approved_date = models.DateTimeField('VM Approved Date', blank=False, null=False)
    sys_aaieduhr = models.CharField(
        'Sys AAIEduHR',
        max_length=30,
        blank=False,
        null=False
    )


class VMOS(models.Model):
    vm_os = models.CharField(
        'VM OS',
        max_length=50,
        blank=False,
        null=False
    )
