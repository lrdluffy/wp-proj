from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rewards.views import RewardViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'rewards', RewardViewSet, basename='reward')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
