from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rewards.models import Reward, Payment
from rewards.serializers import RewardSerializer, PaymentSerializer
from accounts.permissions import IsCaptainOrHigher, IsSergeantOrHigher
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        description='List rewards (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count': 1, 'next': None, 'previous': None, 'results': [{'id': 1, 'description': 'Reward for tip', 'status': 'PENDING'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve a single reward by id.',
        responses={200: RewardSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Retrieve example', value={'id': 1, 'description': 'Reward for tip', 'status': 'APPROVED', 'amount': 500.0}, response_only=True)]
    ),
    create=extend_schema(
        description='Create a reward request.',
        request=RewardSerializer,
        responses={201: RewardSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Create request', value={'case': 1, 'description': 'Tip reward', 'recipient': 2}, request_only=True),
            OpenApiExample('Create response', value={'id': 1, 'case': 1, 'description': 'Tip reward', 'recipient': 2, 'status': 'PENDING'}, response_only=True),
        ]
    ),
    update=extend_schema(
        description='Replace an existing reward.',
        request=RewardSerializer,
        responses={200: RewardSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    partial_update=extend_schema(
        description='Partially update a reward.',
        request=RewardSerializer,
        responses={200: RewardSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    destroy=extend_schema(
        description='Delete a reward.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
    ),
)
@extend_schema(tags=['Rewards'], description='Manage rewards and payments')
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


@extend_schema_view(
    list=extend_schema(
        description='List payments (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('Payments list', value={'count':1,'next':None,'previous':None,'results':[{'id':1,'payment_number':'PAY-123','status':'COMPLETED'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve payment details by id.',
        responses={200: PaymentSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Payment retrieve', value={'id':1,'payment_number':'PAY-123','status':'COMPLETED','amount':500.0}, response_only=True)]
    ),
    create=extend_schema(
        description='Create/initiate a payment.',
        request=PaymentSerializer,
        responses={201: PaymentSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[
            OpenApiExample('Payment request', value={'payment_number':'PAY-123','case':1,'amount':500.0,'payment_method':'BANK_TRANSFER'}, request_only=True),
            OpenApiExample('Payment response', value={'id':1,'payment_number':'PAY-123','status':'PENDING','amount':500.0}, response_only=True),
        ]
    ),
    update=extend_schema(
        description='Replace a payment record.',
        request=PaymentSerializer,
        responses={200: PaymentSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    partial_update=extend_schema(
        description='Partially update a payment.',
        request=PaymentSerializer,
        responses={200: PaymentSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    destroy=extend_schema(
        description='Delete a payment.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
    ),
)
@extend_schema(tags=['Payments'], description='Manage payments for rewards')
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['payment_type', 'status', 'case', 'payment_method']
    search_fields = ['payment_number', 'payer_name', 'payer_email', 'transaction_id']
    ordering_fields = ['created_at', 'initiated_at', 'completed_at']
    ordering = ['-created_at']