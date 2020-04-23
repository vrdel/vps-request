from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.conf import settings

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
        parser.add_argument('--set', action='store_true', dest='operation_set', help='Set password for user')
        parser.add_argument('--is-staff', action='store_true', default=False, dest='isstaff', help='Make user staff')
        parser.add_argument('--approve-request', action='store_true', default=False, dest='approverequest', help='User can approve request')
        parser.add_argument('--username', type=str, dest='username', help='Username of user', required=False)
        parser.add_argument('--password', type=str, dest='password', help='Password of user')
        parser.add_argument('--permissions-config', action='store_true',
                            default=False, dest='permissions_config',
                            help='Pick usernames and permissions from default config')

    def handle(self, *args, **options):
        if options['permissions_config']:
            staff_users_db = self.user_model.objects.filter(is_staff=1)

            # first reset all
            for user in staff_users_db:
                user.is_staff = 0
                user.save()

            # set staff for users listed in config
            staff_users_config = self.user_model.objects.filter(username__in=settings.PERMISSIONS_STAFF)
            for user in staff_users_config:
                user.is_staff = 1
                user.save()

            # first reset all
            pu = Permission.objects.get(codename='approve_request')
            for user in self.user_model.objects.all():
                if user.has_perm('backend.approve_request'):
                    user.user_permissions.remove(pu)

            # set approve_request for users listed in config
            approve_user_config = self.user_model.objects.filter(username__in=settings.PERMISSIONS_APPROVE)
            for user in approve_user_config:
                user.user_permissions.add(pu)

        elif options['operation_create']:
            try:
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
            except Exception as exp:
                self.stderr.write(repr(exp))

        elif options['operation_delete']:
            try:
                user = self.user_model.objects.get(username=options['username'])
                user.delete()
                self.stdout.write('User {0} succesfully deleted'.format(options['username']))
            except Exception as exp:
                self.stderr.write(repr(exp))

        elif options['operation_set']:
            try:
                user = self.user_model.objects.get(username=options['username'])
                user.set_password(options['password'])
                user.save()
                self.stdout.write('User password set'.format(options['username']))
            except Exception as exp:
                self.stderr.write(repr(exp))
