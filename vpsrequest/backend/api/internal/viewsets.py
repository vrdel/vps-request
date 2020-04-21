from backend import serializers
from backend import models
from backend.email.notif import Notification

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
    serializer_class = serializers.RequestsCUSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return models.Request.objects.all()
        else:
            return models.Request.objects.filter(user=user)

    @action(detail=False)
    def mine(self, request):
        user = request.user
        requests = models.Request.objects.filter(user=user)
        serializer = serializers.RequestsListSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def approved(self, request):
        requests = models.Request.objects.filter(approved__gte=1).order_by('-approved_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def rejected(self, request):
        requests = models.Request.objects.filter(approved=0).order_by('-approved_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def new(self, request):
        requests = models.Request.objects.filter(approved=-1).order_by('-request_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True)
    def handlenew(self, request, pk=None):
        request = models.Request.objects.get(pk=pk)
        serializer = serializers.RequestsListSerializer(request)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        sendMsgContact = request.data.pop('sendMsgContact', False)
        sendMsgHead = request.data.pop('sendMsgHead', False)

        ret = super().partial_update(request, pk)
        request = ret.data

        notification = Notification(request['id'])
        if sendMsgContact:
            notification.composeFreshRequestUserEmail()
        if sendMsgHead:
            notification.composeFreshRequestHeadEmail()

        return ret

    def create(self, request):
        response = super().create(request)
        new_request = response.data
        notification = Notification(new_request['id'])
        notification.composeFreshRequestAdminEmail()
        notification.composeFreshRequestUserEmail()
        notification.composeFreshRequestHeadEmail()

        return response


class UsersViewset(viewsets.ModelViewSet):
    serializer_class = serializers.UsersSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return get_user_model().objects.all()
        else:
            return get_user_model().objects.filter(id=user.id)
