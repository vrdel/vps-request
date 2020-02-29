from rest_framework import routers
from backend.api.internal import views

router = routers.DefaultRouter()
router.register(r'requests', views.RequestsViewset)
router.register(r'users', views.UsersViewset)
