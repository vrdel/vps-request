from django.urls import path
from django.conf.urls import include

from . import views

app_name = 'backend'

urlpatterns = [
    path('internal/', include('backend.api.internal.urls', namespace='internal'))
]
