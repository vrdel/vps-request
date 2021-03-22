from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Q

from rest_framework.response import Response
from rest_framework.views import APIView

from backend import serializers
from backend import models


class IsSessionActive(APIView):
    def get(self, request):
        userdetails = dict()
        user = get_user_model().objects.get(id=self.request.user.id)
        serializer = serializers.UsersSerializer(user)
        userdetails.update(serializer.data)
        perms = list(user.user_permissions.all().values_list('codename', flat=True))
        userdetails['perms'] = perms
        userdetails['vmisactive_responsedate'] = settings.VMISACTIVE_RESPONSEDATE
        user_request = models.Request.objects.filter(user__id=user.id).filter(Q(vm_isactive=None) | Q(vm_isactive=-1))
        userdetails['vmisactive_shouldask'] = settings.VMISACTIVE_SHOULDASK_DATE and len(list(user_request)) > 0
        request_question = models.Request.objects.filter(user__id=user.id).filter(Q(vm_isactive=None) | Q(vm_isactive__in=[-1, 0, 1]))
        userdetails['vmisactive_navlink'] = len(list(request_question)) > 0

        return Response({'active': True, 'userdetails': userdetails})
