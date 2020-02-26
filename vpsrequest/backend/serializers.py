from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


class RequestsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'user', 'timestamp', 'location', 'request_date',
                  'head_firstname', 'head_lastname', 'head_institution',
                  'head_role', 'head_email', 'vm_purpose', 'vm_os',
                  'vm_remark', 'vm_admin_remark', 'vm_fqdn', 'vm_reason',
                  'vm_host', 'vm_ip', 'vm_ready', 'vm_dismissed',
                  'sys_firstname', 'sys_lastname', 'sys_institution',
                  'sys_role', 'sys_email', 'approved', 'approvedby',
                  'approved_date', 'sys_aaieduhr')
        model = models.Request


class UsersSerializer(serializers.ModelSerializer):
    requests = RequestsSerializer(many=True, read_only=True)
    class Meta:
        fields = ('aaieduhr', 'institution', 'role', 'first_name', 'last_name',
                  'username', 'is_active', 'is_superuser', 'is_staff', 'email',
                  'date_joined', 'requests', 'pk')
        model = get_user_model()


class VMOSSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('vm_os',)
        model = models.VMOS
