from django.urls import path

from . import views

app_name = 'backend'

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
    path('config_options/', views.GetConfigOptions.as_view(), name='config_options'),
    path('users/', views.ListUsers.as_view(), name='users'),
    path('users/<str:username>', views.ListUsers.as_view(), name='users'),
    path('saml2login', views.Saml2Login.as_view(), name='saml2login'),
    path('vmos', views.VMOS.as_view(), name='vmos'),
    path('requests/', views.ListRequests.as_view(), name='requests'),
    path('requests/<int:pk>', views.ListRequests.as_view(), name='requests'),
]
