from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import CaseViewSet, CrimeSceneViewSet

router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'crime-scenes', CrimeSceneViewSet, basename='crimeScene')

urlpatterns = [
    path('', include(router.urls)),
]
