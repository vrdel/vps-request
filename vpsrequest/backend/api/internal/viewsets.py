from backend import serializers
from backend import models

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from rest_framework import status
from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.exceptions import APIException

from datetime import datetime



class VMOSViewset(viewsets.ModelViewSet):
    queryset = models.VMOS.objects.all()
    serializer_class = serializers.VMOSSerializer


class RequestsViewset(viewsets.ModelViewSet):
    serializer_class = serializers.RequestsSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return models.Request.objects.all()
        else:
            return models.Request.objects.filter(user=user)

    @action(detail=False)
    def mine(self, request):
        user = self.request.user
        requests = models.Request.objects.filter(user=user)
        serializer = serializers.RequestsSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def change(self, request, pk=None):
        reqdb = models.Request.objects.get(id=pk)
        request.data['user'] = reqdb.user.pk
        reqdb.timestamp = datetime.now()
        request.data['request_date'] = reqdb.request_date
        request.data['approved'] = reqdb.approved

        serializer = serializers.RequestsSerializer(reqdb, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsersViewset(viewsets.ModelViewSet):
    queryset = models.User.objects.all()
    serializer_class = serializers.UsersSerializer

    @action(detail=False)
    def mine(self, request):
        user = self.request.user
        me = get_user_model().objects.get(id=user.id)
        serializer = serializers.UsersSerializer(me)

        return Response(serializer.data, status=status.HTTP_200_OK)
