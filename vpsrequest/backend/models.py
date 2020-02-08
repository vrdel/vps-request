from django.db import models
from django.conf import settings

# Create your models here.

class UserProfile(models.Model):
    class Meta:
        app_label = 'backend'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    aaieduhr = models.CharField(
        'hrEduPersonUniqueID',
        max_length=256,
        blank=True,
        null=True,
    )

    institution = models.CharField(
        'Institution',
        max_length=256,
        blank=True,
        null=True
    )

    role = models.CharField(
        'Role',
        max_length=64,
        blank=True,
        null=True
    )
