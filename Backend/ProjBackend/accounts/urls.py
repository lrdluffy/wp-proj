from django.urls import path, include
from rest_framework.routers import SimpleRouter
from accounts.views import UserViewSet

router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', UserViewSet.as_view({'post': 'register'}), name='user-register'),
    path('login/', UserViewSet.as_view({'post': 'login'}), name='user-login'),

    path('', include(router.urls)),
]