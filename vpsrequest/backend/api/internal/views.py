from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from backend import serializers


class NotFound(APIException):
    def __init__(self, status, detail, code=None):
        self.status_code = status
        self.detail = detail
        self.code = code if code else detail


class ListUsers(APIView):
    authentication_classes = (SessionAuthentication,)

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
