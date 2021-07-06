from backend import serializers
from backend import models

from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.renderers import StaticHTMLRenderer


class ApprovedVPSViewset(viewsets.ModelViewSet):
    serializer_class = serializers.RequestsCUSerializer
    renderer_classes = [StaticHTMLRenderer]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return models.Request.objects.all()
        else:
            return models.Request.objects.filter(user=user)

    @action(detail=False)
    def generate(self, request):
        requests = models.Request.objects.filter(approved=2).order_by('-approved_date')
        serializer = serializers.RequestsListSerializer(requests, many=True)

        output = ''
        for req in serializer.data:
            output += req['vm_fqdn'] + ' ' + req['user']['email'] + ' ' + req['sys_email'] + '<br>'

        return Response(output)
