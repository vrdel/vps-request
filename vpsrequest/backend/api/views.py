from django.conf import settings
from django.core.cache import cache

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class GetConfigOptions(APIView):
    authentication_classes = ()
    permission_classes = ()

    def get(self, request):
        options = dict()

        if settings.ALWAYS_LOGGEDIN:
            options.update(AlwaysLoggedIn=settings.ALWAYS_LOGGEDIN)
            options.update(SuperUser=settings.SUPERUSER_NAME)

        return Response({'result': options})


class IsSessionActive(APIView):
    def get(self, request):
        user = dict()

        for key in ['username', 'first_name', 'last_name', 'email', 'is_staff',
                    'is_active', 'aaieduhr', 'institution', 'role']:
            user[key] = eval('request.user.{}'.format(key))

        return Response({'active': True, 'userdetails': user})


class Saml2Login(APIView):
    keys = ['username', 'first_name', 'last_name', 'is_superuser']

    def _prefix(self, keys):
        return ['saml2_' + key for key in keys]

    def _remove_prefix(self, keys):
        new_keys = dict()

        for k, v in keys.items():
            new_keys[k.split('saml2_')[1]] = v

        return new_keys

    def get(self, request):
        result = cache.get_many(self._prefix(self.keys))

        return Response(self._remove_prefix(result))

    def delete(self, request):
        cache.delete_many(self._prefix(self.keys))

        return Response(status=status.HTTP_204_NO_CONTENT)
