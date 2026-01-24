from django.urls import path, include
from rest_framework.routers import DefaultRouter
from witnesses.views import WitnessStatementViewSet

router = DefaultRouter()
router.register(r'witness-statements', WitnessStatementViewSet, basename='witness-statement')

urlpatterns = [
    path('', include(router.urls)),
]
