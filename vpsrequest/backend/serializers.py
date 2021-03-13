from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('aaieduhr', 'institution', 'role', 'first_name', 'last_name',
                  'username', 'is_active', 'is_superuser', 'is_staff', 'email',
                  'date_joined', 'pk', 'id')
        model = get_user_model()


class RequestsCUSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'timestamp', 'location', 'request_date',
                  'head_firstname', 'head_lastname', 'head_institution',
                  'head_role', 'head_email', 'vm_purpose', 'vm_os',
                  'vm_remark', 'vm_admin_remark', 'vm_fqdn', 'vm_reason',
                  'vm_ip', 'vm_dismissed', 'sys_firstname',
                  'sys_lastname', 'sys_institution', 'sys_role', 'sys_email',
                  'approved', 'approvedby', 'approved_date', 'sys_aaieduhr',
                  'user')
        model = models.Request


class RequestsListSerializer(RequestsCUSerializer):
    user = UsersSerializer(read_only=True)


class RequestsListActiveSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'timestamp', 'request_date', 'vm_fqdn', 'vm_ip',
                  'vm_isactive', 'vm_isactive_comment', 'vm_isactive_response',
                  'sys_email', 'approved', 'user')
        model = models.Request


class RequestsListActiveWithUserSerializer(RequestsListActiveSerializer):
    user = UsersSerializer(read_only=True)


class VMOSSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('vm_os',)
        model = models.VMOS
