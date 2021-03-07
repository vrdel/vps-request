from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db import DEFAULT_DB_ALIAS
from django.db.utils import IntegrityError

from backend import models

class Command(BaseCommand):
    help = 'Used to create a superuser.'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        parser.add_argument('--setnull', action='store_true', dest='operation_set', help='Set vm_isactive field to initial value for requests')
        parser.add_argument('--username', type=str, dest='username', help='Username of user', required=False)

    def handle(self, *args, **options):
        if options['username']:
            userdb = self.user_model.objects.get(username=options['username'])
            user_request = models.Request.objects.filter(user__id=userdb.pk)
            for req in user_request:
                req.vm_isactive = None
                req.save()
        else:
            pass
