from django.contrib.auth import get_user_model

from rest_framework.response import Response
from rest_framework.views import APIView

from backend import serializers


class IsSessionActive(APIView):
    def get(self, request):
        userdetails = dict()
        user = get_user_model().objects.get(id=self.request.user.id)
        serializer = serializers.UsersSerializer(user)
        userdetails.update(serializer.data)
        perms = list(user.user_permissions.all().values_list('codename', flat=True))
        userdetails['perms'] = perms

        return Response({'active': True, 'userdetails': userdetails})
