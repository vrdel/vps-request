from rest_framework import routers
from . import viewsets

app_name = 'backend'

router = routers.DefaultRouter()
router.register(r'vmos', viewsets.VMOSViewset)
router.register(r'requests', viewsets.RequestsViewset, 'requests')
router.register(r'users', viewsets.UsersViewset, 'users')


urlpatterns = router.urls
