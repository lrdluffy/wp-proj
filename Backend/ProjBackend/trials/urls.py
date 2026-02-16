from django.urls import path, include
from rest_framework.routers import SimpleRouter
from trials.views import TrialViewSet

router = SimpleRouter()
router.register(r'trials', TrialViewSet, basename='trial')

urlpatterns = [
    path('', include(router.urls)),
]
