from django.contrib.auth import get_user_model
from django.conf import settings

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
        user_request = models.Request.objects.filter(user__id=user.id).filter(vm_isactive__in=[None,-1])
        userdetails['vmisactive_shouldask'] = settings.VMISACTIVE_SHOULDASK_DATE and len(list(user_request)) > 0

        return Response({'active': True, 'userdetails': userdetails})
