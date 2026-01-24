from django.urls import path, include
from rest_framework.routers import DefaultRouter
from trials.views import TrialViewSet

router = DefaultRouter()
router.register(r'trials', TrialViewSet, basename='trial')

urlpatterns = [
    path('', include(router.urls)),
]
