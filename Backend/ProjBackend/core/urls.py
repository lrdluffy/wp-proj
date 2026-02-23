from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import CaseViewSet, CrimeSceneViewSet, ComplaintViewSet

router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'crime-scenes', CrimeSceneViewSet, basename='crimeScene')
router.register(r'complaints', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('', include(router.urls)),
]