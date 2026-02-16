from django.urls import path, include
from rest_framework.routers import SimpleRouter
from witnesses.views import WitnessStatementViewSet

router = SimpleRouter()
router.register(r'witness-statements', WitnessStatementViewSet, basename='witness-statement')

urlpatterns = [
    path('', include(router.urls)),
]
