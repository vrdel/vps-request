from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.db.models import Q
from django.db.utils import IntegrityError

from backend import models

class Command(BaseCommand):
    help = 'Used to create a superuser.'
    requires_migrations_checks = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        parser.add_argument('--setinitial', action='store_true', dest='setinitial', help='Set vm_isactive=5 as initial value', required=False)
        parser.add_argument('--setnull', action='store_true', dest='setnull', help='Null vm_isactive for untouched requests; --year mandatory')
        parser.add_argument('--setallnull', action='store_true', dest='setallnull', help='Null vm_isactive for all issued requests; --year mandatory')
        parser.add_argument('--setretire50', action='store_true', dest='setretire50', help='For retired requests set vm_isactive=50 to skip them on retired views; --year optional')
        parser.add_argument('--username', type=str, dest='username', help='Username of user', required=False)
        parser.add_argument('--year', type=int, dest='year', help='Year')

    def handle(self, *args, **options):
        if options['setinitial']:
            requests = models.Request.objects.all()
            if options['year']:
                requests = requests.filter(request_date__year=options['year'])
            requests.update(vm_isactive=5)

        elif options['setretire50']:
            requests = models.Request.objects.\
                filter(approved__exact=settings.STATUSES['Umirovljen'])
            requests = requests.filter(vm_isactive=0)
            if options['year']:
                requests = requests.filter(request_date__year=options['year'])
            requests.update(vm_isactive=50)

        elif options['username'] and options['year'] and (options['setnull'] or options['setallnull']):
            userdb = self.user_model.objects.get(username=options['username'])
            user_request = models.Request.objects.filter(user__id=userdb.pk)
            user_request = user_request.filter(approved__exact=settings.STATUSES['Izdan VM'])
            if options['setnull']:
                user_request = user_request.filter(~Q(vm_isactive__in=[-1, 0, 1]))
            user_request = user_request.filter(request_date__year=options['year'])
            for req in user_request:
                req.vm_isactive = None
                req.vm_isactive_comment = None
                req.vm_isactive_response = None
                req.save()

        elif options['year'] and (options['setnull'] or options['setallnull']):
            requests = models.Request.objects.\
                filter(approved__exact=settings.STATUSES['Izdan VM'])
            requests = requests.filter(request_date__year=options['year'])
            if options['setnull']:
                requests = requests.filter(~Q(vm_isactive__in=[-1, 0, 1]))
            requests.update(vm_isactive=None, vm_isactive_comment=None, vm_isactive_response=None)
