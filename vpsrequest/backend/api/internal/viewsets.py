from backend import serializers
from backend import models
from backend.email.notif import Notification

from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action


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
        user = self.request.user
        
        oldReq = models.Request.objects.get(pk=pk)
        serializer = serializers.RequestsListSerializer(oldReq)
        oldRequest = serializer.data

        ret = super().partial_update(request, pk)
        newRequest = ret.data
        notification = Notification(newRequest['id'])
        
        # state transitions mail sending
        if (oldRequest['approved'] == 2 and newRequest['approved']  > 1) or (oldRequest['approved'] == 1 and newRequest['approved']  == 2):
            notification.sendChangedRequestEmail(oldRequest)
        elif oldRequest['approved'] == -1 and newRequest['approved'] == -1:
            if user.is_staff:
                notification.sendFixRequestEmail(sendMsgContact, sendMsgHead)
            else:
                notification.sendChangedRequestEmail(oldRequest)
        elif oldRequest['approved'] == -1 and newRequest['approved'] == 0:
            notification.sendRejecedRequestEmail(sendMsgContact, sendMsgHead)
        elif oldRequest['approved'] == -1 and newRequest['approved'] == 1:
            notification.sendApprovedRequestEmail(sendMsgContact, sendMsgHead)

        return ret

    def create(self, request):
        response = super().create(request)
        new_request = response.data
        notification = Notification(new_request['id'])
        notification.sendFreshRequestAdminEmail()
        notification.sendFreshRequestUserEmail()
        notification.sendFreshRequestHeadEmail()

        return response


class UsersViewset(viewsets.ModelViewSet):
    serializer_class = serializers.UsersSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return get_user_model().objects.all()
        else:
            return get_user_model().objects.filter(id=user.id)
