from rest_framework import serializers

from accounts.serializers import UserSerializer
from core.serializers import CaseSerializer
from rewards.models import Reward, Payment

class RewardSerializer(serializers.ModelSerializer):
    reward_type_display = serializers.CharField(source='get_reward_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_detail = CaseSerializer(source='case', read_only=True)
    recipient_detail = UserSerializer(source='recipient', read_only=True)
    approved_by_detail = UserSerializer(source='approved_by', read_only=True)

    class Meta:
        model = Reward
        fields = [
            'id', 'case', 'case_detail', 'recipient', 'recipient_detail',
            'reward_type', 'reward_type_display', 'description', 'amount',
            'status', 'status_display', 'approved_by', 'approved_by_detail',
            'approved_at', 'rejection_reason', 'paid_at', 'payment_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_detail = CaseSerializer(source='case', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'payment_number', 'payment_type', 'payment_type_display',
            'amount', 'status', 'status_display', 'case', 'case_detail',
            'reward', 'payer_name', 'payer_email', 'payer_phone',
            'payment_method', 'transaction_id', 'payment_reference',
            'initiated_at', 'completed_at', 'description', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'initiated_at']
