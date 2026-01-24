from django.urls import path, include
from rest_framework.routers import DefaultRouter
from suspects.views import SuspectViewSet

router = DefaultRouter()
router.register(r'suspects', SuspectViewSet, basename='suspect')

urlpatterns = [
    path('', include(router.urls)),
]
