from django.urls import path, include
from rest_framework.routers import SimpleRouter
from rewards.views import RewardViewSet, PaymentViewSet

router = SimpleRouter()
router.register(r'rewards', RewardViewSet, basename='reward')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
