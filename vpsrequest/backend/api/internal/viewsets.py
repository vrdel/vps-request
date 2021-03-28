from backend import serializers
from backend import models
from backend.email.notif import Notification

from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Q

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
                req['vm_isactive'] = settings.STATUSESVMACTIVE[req['vm_isactive']]
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
            requests = models.Request.objects.filter(user=user).filter(approved__in=[2, 3])
            requests = requests.filter(Q(vm_isactive=None) | Q(vm_isactive__in=[-1, 0, 1]))
            serializer = serializers.RequestsListActiveSerializer(requests, many=True)
            for data in serializer.data:
                if data['vm_isactive'] == 1 or data['vm_isactive'] == 0:
                    data['vm_isactive'] = settings.STATUSESVMACTIVE[data['vm_isactive']]

            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def approved(self, request):
        user = request.user

        if user.is_staff or user.is_superuser:
            requests = models.Request.objects.filter(approved__gte=1).order_by('-approved_date')
            serializer = serializers.RequestsListSerializer(requests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['patch', 'get'])
    def vmissued_retire(self, request):
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'PATCH':
            req = request.data
            id = req['id']
            req_db = models.Request.objects.get(id=id)
            if req_db.vm_isactive != req['vm_isactive']:
                req['vm_isactive_response'] = datetime.datetime.now()
            req['vm_isactive'] = settings.STATUSESVMACTIVE[req['vm_isactive']]
            serializer = serializers.RequestsListActiveWithUserSerializer(req_db, data=req)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            requests = models.Request.objects.filter(approved__in=[2, 3]).order_by('-approved_date')
            requests = requests.filter(Q(vm_isactive=None) | Q(vm_isactive__in=[-1, 0, 1]))
            serializer = serializers.RequestsListActiveWithUserSerializer(requests, many=True)
            for data in serializer.data:
                if data['vm_isactive'] == 1 or data['vm_isactive'] == 0:
                    data['vm_isactive'] = settings.STATUSESVMACTIVE[data['vm_isactive']]
            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch', 'get'])
    def vmissued_retire_stats(self, request):
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

        yes, no, unknown = None, None, None

        yes = len(models.Request.objects.filter(approved=2).filter(vm_isactive=1))
        no = len(models.Request.objects.filter(approved__in=[2, 3]).filter(vm_isactive=0))
        unknown = len(models.Request.objects.filter(approved=2).filter(vm_isactive=None))

        return Response({
            'yes': yes,
            'no': no,
            'unknown': unknown
        }, status=status.HTTP_200_OK)

    @action(detail=False)
    def rejected(self, request):
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

        requests = models.Request.objects.filter(approved=0).order_by('-approved_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def new(self, request):
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

        requests = models.Request.objects.filter(approved=-1).order_by('-request_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True)
    def handlenew(self, request, pk=None):

        serializer = serializers.RequestsListSerializer(request)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False)
    def stats(self, request):
        user = request.user

        if not user.is_staff and not user.is_superuser:
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)

        active, retired = None, None

        active = len(models.Request.objects.filter(approved=2))
        retired = len(models.Request.objects.filter(approved=3))

        return Response({
            'active': active,
            'retired': retired
        }, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        user = self.request.user
        old_req = models.Request.objects.get(pk=pk)

        if not user.is_staff and not user.is_superuser:
            if old_req.approved in [1, 2, 3]:
                return Response(status=status.HTTP_403_FORBIDDEN)

            for skip in ["head_institution", "approved", "timestamp",
                         "vm_reason", "vm_ip", "vm_admin_remark", "approvedby"]:
                request.data.pop(skip, None)

        changed_contact = request.data.pop('changedContact', False)
        sendmsg_contact = request.data.pop('sendMsgContact', False)
        sendmsg_head = request.data.pop('sendMsgHead', False)

        if changed_contact:
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
            old_req.user = user
            old_req.save()

        serializer = serializers.RequestsListSerializer(old_req)
        old_request = serializer.data
        ret = super().partial_update(request, pk)

        if not changed_contact:
            new_request = ret.data
            if settings.MAIL_SEND:
                notification = Notification(new_request['id'])

                # state transitions mail sending
                if (old_request['approved'] == 2 and new_request['approved'] > 1) or (old_request['approved'] == 1 and new_request['approved'] == 2):
                    notification.sendChangedRequestEmail(old_request)
                elif old_request['approved'] == -1 and new_request['approved'] == -1:
                    if user.is_staff:
                        notification.sendFixRequestEmail(sendmsg_contact, sendmsg_head)
                    else:
                        notification.sendChangedRequestEmail(old_request)
                elif old_request['approved'] == -1 and new_request['approved'] == 0:
                    notification.sendRejecedRequestEmail(sendmsg_contact, sendmsg_head)
                elif old_request['approved'] == -1 and new_request['approved'] == 1:
                    notification.sendApprovedRequestEmail(sendmsg_contact, sendmsg_head)

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
