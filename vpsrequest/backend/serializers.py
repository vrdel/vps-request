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
                  'vm_host', 'vm_ip', 'vm_ready', 'vm_dismissed',
                  'sys_firstname', 'sys_lastname', 'sys_institution',
                  'sys_role', 'sys_email', 'approved', 'approvedby',
                  'approved_date', 'sys_aaieduhr', 'user')
        model = models.Request


class RequestsListSerializer(RequestsCUSerializer):
    user = UsersSerializer(read_only=True)


class VMOSSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('vm_os',)
        model = models.VMOS

class ListRequestsSerializer(serializers.ModelSerializer):
    contact_name = serializers.ReadOnlyField(source='user.first_name')
    contact_lastname = serializers.ReadOnlyField(source='user.last_name')

    class Meta:
        fields = ('id', 'request_date', 'vm_host', 'head_institution',
                  'approved', 'approved_date', 'contact_name', 'contact_lastname')
        model = models.Request