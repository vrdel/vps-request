from rest_framework import serializers
from django.contrib.auth import get_user_model
from backend import models


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('aaieduhr', 'institution', 'role', 'first_name', 'last_name',
                  'username', 'is_active', 'is_superuser', 'is_staff', 'email',
                  'date_joined', 'pk')
        model = get_user_model()


class RequestsSerializer(serializers.ModelSerializer):
    user = UsersSerializer(read_only=True)
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

class VMOSSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('vm_os',)
        model = models.VMOS
