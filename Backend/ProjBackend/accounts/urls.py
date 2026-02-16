from django.urls import path, include
from rest_framework.routers import SimpleRouter
from accounts.views import UserViewSet

router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
