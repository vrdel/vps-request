from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from backend import serializers


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
        user = get_user_model().objects.get(id=self.request.user.id)
        serializer = serializers.UsersSerializer(user)

        return Response({'active': True, 'userdetails': serializer.data})


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
