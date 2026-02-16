from django.urls import path, include
from rest_framework.routers import SimpleRouter
from suspects.views import SuspectViewSet

router = SimpleRouter()
router.register(r'suspects', SuspectViewSet, basename='suspect')

urlpatterns = [
    path('', include(router.urls)),
]
