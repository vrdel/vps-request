from backend import serializers
from backend import models
from backend.email.notif import Notification

from django.contrib.auth import get_user_model
from django.conf import settings

from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.renderers import StaticHTMLRenderer

import datetime


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

    @action(detail=False, methods=['patch', 'get'])
    def mine_active(self, request):
        user = request.user

        if request.method == 'PATCH':
            rets = list()
            for req in request.data:
                id = req['id']
                req_db = models.Request.objects.get(id=id)
                if req_db.vm_isactive != req['vm_isactive']:
                    req['vm_isactive_response'] = datetime.datetime.now()

                req['user'] = user.pk
                serializer = serializers.RequestsListActiveSerializer(req_db, data=req)
                if serializer.is_valid():
                    serializer.save()
                    rets.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(rets)

        else:
            requests = models.Request.objects.filter(user=user).filter(approved=2)
            serializer = serializers.RequestsListActiveSerializer(requests, many=True)
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

    @action(detail=False)
    def stats(self, request):
        active, retired = None, None

        active = len(models.Request.objects.filter(approved=2))
        retired = len(models.Request.objects.filter(approved=3))

        return Response({
            'active': active,
            'retired': retired
        }, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        changedContact = request.data.pop('changedContact', False)
        sendMsgContact = request.data.pop('sendMsgContact', False)
        sendMsgHead = request.data.pop('sendMsgHead', False)
        user = self.request.user

        oldReq = models.Request.objects.get(pk=pk)

        if changedContact:
            data = request.data
            user = None
            user_model = get_user_model()
            try:
                user = user_model.objects.get(username=data['aaieduhr'])
            except user_model.DoesNotExist:
                user = user_model.objects.create(username=data['aaieduhr'],
                                                 first_name=data['first_name'],
                                                 last_name=data['last_name'],
                                                 email=data['email'],
                                                 role=data['role'],
                                                 aaieduhr=data['aaieduhr'],
                                                 institution=data['institution'],
                                                 is_staff=False,
                                                 is_active=True)
            oldReq.user = user
            oldReq.save()

        serializer = serializers.RequestsListSerializer(oldReq)
        oldRequest = serializer.data
        ret = super().partial_update(request, pk)

        if not changedContact:
            newRequest = ret.data
            if settings.MAIL_SEND:
                notification = Notification(newRequest['id'])

                # state transitions mail sending
                if (oldRequest['approved'] == 2 and newRequest['approved'] > 1) or (oldRequest['approved'] == 1 and newRequest['approved'] == 2):
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
        if settings.MAIL_SEND:
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
