from django.urls import path, include
from rest_framework.routers import SimpleRouter
from complaints.views import ComplaintViewSet

router = SimpleRouter()
router.register(r'complaints', ComplaintViewSet, basename='complaints')

urlpatterns = [
    path('', include(router.urls)),
]
