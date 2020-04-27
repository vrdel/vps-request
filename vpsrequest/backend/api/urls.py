from django.urls import path

from . import views

app_name = 'backend'

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
]
