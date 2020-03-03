from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission

import random

ALPHACHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"


class Command(BaseCommand):
    help = "Create additional user with different roles for testing purposes"

    def __init__(self):
        super().__init__()
        self.user_model = get_user_model()

    def add_arguments(self, parser):
        parser.add_argument('--create', action='store_true', dest='operation_create', help='Create new user')
        parser.add_argument('--delete', action='store_true', dest='operation_delete', help='Delete user')
        parser.add_argument('--is-staff', action='store_true', default=False, dest='isstaff', help='Make user staff')
        parser.add_argument('--approve-request', action='store_true', default=False, dest='approverequest', help='User can approve request')
        parser.add_argument('--username', type=str, dest='username', help='Username of user', required=True)
        parser.add_argument('--password', type=str, dest='password', help='Password of user')

    def handle(self, *args, **options):
        if options['operation_create']:
            user = self.user_model.objects.create_user(options['username'],
                                                       '{0}@email.hr'.format(options['username']),
                                                       options['password'])
            user.institution = 'SRCE'
            user.is_staff = options['isstaff'] or options['approverequest']
            user.role = 'Outsider'
            user.aaieduhr = options['username']
            user.first_name = ''.join(random.sample(ALPHACHARS, 8))
            user.last_name = ''.join(random.sample(ALPHACHARS, 8))
            user.save()

            if options['approverequest']:
                pu = Permission.objects.get(codename='approve_request')
                user.user_permissions.add(pu)

            self.stdout.write('User {0} succesfully created'.format(options['username']))

        elif options['operation_delete']:
            try:
                user = self.user_model.objects.get(username=options['username'])
                user.delete()
                self.stdout.write('User {0} succesfully deleted'.format(options['username']))
            except Exception as exp:
                self.stderr.write(repr(exp))
