from django.urls import path

from . import views

app_name = 'backend'

urlpatterns = [
    path('sessionactive/', views.IsSessionActive.as_view(), name='sessionactive'),
    path('configoptions/', views.GetConfigOptions.as_view(), name='configoptions'),
    path('saml2login/', views.Saml2Login.as_view(), name='saml2login'),
]
