from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rewards.models import Reward, Payment
from rewards.serializers import RewardSerializer, PaymentSerializer
from accounts.permissions import IsCaptainOrHigher, IsSergeantOrHigher


class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'recipient', 'reward_type', 'status', 'approved_by']
    search_fields = ['description']
    ordering_fields = ['created_at', 'approved_at', 'paid_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create']:
            return [IsSergeantOrHigher()]
        elif self.action in ['update', 'partial_update']:
            # Only captains and chiefs can approve rewards
            return [IsCaptainOrHigher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Users can only see their own rewards unless they're captains or higher
        if self.request.user.is_captain() or self.request.user.is_chief():
            return Reward.objects.all()
        return Reward.objects.filter(recipient=self.request.user)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment_type', 'status', 'case', 'payment_method']
    search_fields = ['payment_number', 'payer_name', 'payer_email', 'transaction_id']
    ordering_fields = ['created_at', 'initiated_at', 'completed_at']
    ordering = ['-created_at']