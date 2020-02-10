from backend import serializers
from backend import models

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError

from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import APIException


class BaseProtectedAPIView(APIView):
    if settings.ALWAYS_LOGGEDIN:
        authentication_classes = ()
        permission_classes = ()
    else:
        authentication_classes = (SessionAuthentication,)


class NotFound(APIException):
    def __init__(self, status, detail, code=None):
        self.status_code = status
        self.detail = detail
        self.code = code if code else detail


class ListUsers(BaseProtectedAPIView):
    def get(self, request, username=None):
        if username:
            try:
                user = get_user_model().objects.get(username=username)
                serializer = serializers.UsersSerializer(user)
                return Response(serializer.data)

            except get_user_model().DoesNotExist:
                raise NotFound(status=404,
                               detail='User not found')

        else:
            users = get_user_model().objects.all()
            serializer = serializers.UsersSerializer(users, many=True)

            data = sorted(serializer.data, key=lambda k: k['username'].lower())

            return Response(data)

    def put(self, request):
        try:
            user = get_user_model().objects.get(pk=request.data['pk'])
            user.username = request.data['username']
            user.first_name = request.data['first_name']
            user.last_name = request.data['last_name']
            user.email = request.data['email']
            user.is_superuser = request.data['is_superuser']
            user.is_staff = request.data['is_staff']
            user.is_active = request.data['is_active']
            user.save()

            return Response(status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {'detail': 'User with this username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        try:
            get_user_model().objects.create_user(
                username=request.data['username'],
                password=request.data['password'],
                email=request.data['email'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                is_superuser=request.data['is_superuser'],
                is_staff=request.data['is_staff'],
                is_active=request.data['is_active']
            )

            return Response(status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response(
                {'detail': 'User with this username already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, username=None):
        if username:
            try:
                user = get_user_model().objects.get(username=username)
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

            except get_user_model().DoesNotExist:
                raise(NotFound(status=404, detail='User not found'))

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class GetConfigOptions(APIView):
    authentication_classes = ()
    permission_classes = ()

    def get(self, request):
        options = dict()

        if settings.ALWAYS_LOGGEDIN:
            options.update(AlwaysLoggedIn=settings.ALWAYS_LOGGEDIN)
            options.update(SuperUser=settings.SUPERUSER_NAME)

        return Response({'result': options})


class IsSessionActive(BaseProtectedAPIView):
    def get(self, request):
        return Response({'active': True})


class Saml2Login(BaseProtectedAPIView):
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


class VMOS(BaseProtectedAPIView):
    def get(self, request):
        oses = models.VMOS.objects.all()
        serializer = serializers.VMOSSerializer(oses, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
