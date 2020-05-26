from django.urls import path
from rest_framework import routers
from . import viewsets
from . import views

app_name = 'backend'

router = routers.DefaultRouter()
router.register(r'approved', viewsets.ApprovedVPSViewset, 'approved')

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
] + router.urls
