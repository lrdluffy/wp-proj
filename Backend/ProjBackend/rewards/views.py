import uuid

import requests
from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rewards.models import Reward, Payment, PaymentType, PaymentStatus
from rewards.serializers import RewardSerializer, PaymentSerializer
from accounts.permissions import IsCaptainOrHigher, IsSergeantOrHigher
from suspects.models import Suspect, SuspectStatus


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

    @action(detail=False, methods=['post'], url_path='zarinpal/start')
    def start_zarinpal_payment(self, request):
        """
        Initiate a Zarinpal payment for a suspect's bail based on captain-specified bail_amount.
        """
        suspect_id = request.data.get('suspect_id')
        if not suspect_id:
            return Response({'detail': 'suspect_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            suspect = Suspect.objects.select_related('case').get(pk=suspect_id)
        except Suspect.DoesNotExist:
            return Response({'detail': 'Suspect not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not suspect.bail_amount or suspect.bail_amount <= 0:
            return Response(
                {'detail': 'Bail amount is not set for this suspect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if suspect.bail_paid:
            return Response(
                {'detail': 'Bail is already marked as paid for this suspect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Block starting a new payment if another bail payment is pending/processing
        if Payment.objects.filter(
            suspect=suspect,
            payment_type=PaymentType.BAIL,
            status__in=[PaymentStatus.PENDING, PaymentStatus.PROCESSING],
        ).exists():
            return Response(
                {'detail': 'There is already a bail payment in progress for this suspect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        merchant_id = getattr(settings, 'ZARINPAL_MERCHANT_ID', None)
        if not merchant_id:
            return Response(
                {'detail': 'ZARINPAL_MERCHANT_ID is not configured on the server.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        amount = int(suspect.bail_amount)
        payment_number = f"BAIL-{uuid.uuid4().hex[:12].upper()}"

        payment = Payment.objects.create(
            payment_number=payment_number,
            payment_type=PaymentType.BAIL,
            amount=suspect.bail_amount,
            status=PaymentStatus.PENDING,
            case=suspect.case,
            suspect=suspect,
            payer_name=suspect.full_name,
            payer_email='',
            payer_phone=suspect.phone_number or '',
            payment_method='Zarinpal',
            description=f"Bail payment for suspect {suspect.full_name} in case {suspect.case.case_number}",
        )

        # Build callback URL (Zarinpal will append Authority & Status query params)
        callback_base = request.build_absolute_uri('/api/payments/zarinpal/callback/')
        callback_url = f"{callback_base}?payment_number={payment.payment_number}"

        payload = {
            'merchant_id': merchant_id,
            'amount': amount,
            'callback_url': callback_url,
            'description': payment.description,
            'metadata': {
                'mobile': suspect.phone_number or '',
                'email': '',
            },
        }

        try:
            gateway_response = requests.post(
                'https://sandbox.zarinpal.com/pg/v4/payment/request.json',
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout=10,
            )
        except requests.RequestException:
            payment.status = PaymentStatus.FAILED
            payment.notes = 'Failed to connect to Zarinpal gateway.'
            payment.save(update_fields=['status', 'notes'])
            return Response(
                {'detail': 'Failed to connect to payment gateway.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            result = gateway_response.json()
        except ValueError:
            payment.status = PaymentStatus.FAILED
            payment.notes = 'Invalid JSON response from Zarinpal.'
            payment.save(update_fields=['status', 'notes'])
            return Response(
                {'detail': 'Invalid response from payment gateway.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = result.get('data') or {}
        errors = result.get('errors') or []

        if gateway_response.status_code != 200 or data.get('code') != 100:
            payment.status = PaymentStatus.FAILED
            payment.notes = f"Gateway error: {data.get('message') or errors}"
            payment.save(update_fields=['status', 'notes'])
            return Response(
                {
                    'detail': 'Payment request was rejected by gateway.',
                    'gateway_message': data.get('message'),
                    'gateway_errors': errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        authority = data.get('authority')
        payment.status = PaymentStatus.PROCESSING
        payment.payment_reference = authority
        payment.save(update_fields=['status', 'payment_reference'])

        payment_url = f"https://sandbox.zarinpal.com/pg/StartPay/{authority}"
        return Response(
            {
                'payment_url': payment_url,
                'payment_number': payment.payment_number,
                'authority': authority,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=['get'],
        url_path='zarinpal/callback',
        permission_classes=[AllowAny],
    )
    def zarinpal_callback(self, request):
        """
        Zarinpal callback/verify endpoint.
        Called after the user completes or cancels the payment on Zarinpal.
        """
        status_param = request.query_params.get('Status')
        authority = request.query_params.get('Authority')
        payment_number = request.query_params.get('payment_number')

        if not authority:
            return Response(
                {'detail': 'Authority parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = None
        if payment_number:
            payment = Payment.objects.filter(payment_number=payment_number).first()
        if not payment:
            payment = Payment.objects.filter(payment_reference=authority).first()
        if not payment:
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        merchant_id = getattr(settings, 'ZARINPAL_MERCHANT_ID', None)
        if not merchant_id:
            return Response(
                {'detail': 'ZARINPAL_MERCHANT_ID is not configured on the server.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if status_param != 'OK':
            payment.status = PaymentStatus.FAILED
            payment.notes = f"Payment failed or cancelled. Status={status_param}"
            payment.save(update_fields=['status', 'notes'])
            frontend_base = getattr(settings, 'FRONTEND_BASE_URL', None)
            if frontend_base:
                return HttpResponseRedirect(
                    f"{frontend_base}/payment-result?status=failed&payment_number={payment.payment_number}"
                )
            return Response(
                {
                    'detail': 'Payment was not successful.',
                    'payment_number': payment.payment_number,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        verify_payload = {
            'merchant_id': merchant_id,
            'amount': int(payment.amount),
            'authority': authority,
        }

        try:
            verify_response = requests.post(
                'https://payment.zarinpal.com/pg/v4/payment/verify.json',
                json=verify_payload,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout=10,
            )
        except requests.RequestException:
            return Response(
                {'detail': 'Failed to connect to payment verification service.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            verify_result = verify_response.json()
        except ValueError:
            return Response(
                {'detail': 'Invalid response from payment verification service.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = verify_result.get('data') or {}
        errors = verify_result.get('errors') or []
        code = data.get('code')

        if verify_response.status_code != 200 or code not in (100, 101):
            payment.status = PaymentStatus.FAILED
            payment.notes = f"Verification failed: {data.get('message') or errors}"
            payment.save(update_fields=['status', 'notes'])
            frontend_base = getattr(settings, 'FRONTEND_BASE_URL', None)
            if frontend_base:
                return HttpResponseRedirect(
                    f"{frontend_base}/payment-result?status=failed&payment_number={payment.payment_number}"
                )
            return Response(
                {
                    'detail': 'Payment verification failed.',
                    'gateway_message': data.get('message'),
                    'gateway_errors': errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = PaymentStatus.COMPLETED
        payment.payment_reference = authority
        payment.transaction_id = str(data.get('ref_id'))
        payment.completed_at = timezone.now()
        payment.notes = f"Verified with code {code} via Zarinpal."
        payment.save(update_fields=['status', 'payment_reference', 'transaction_id', 'completed_at', 'notes'])

        # Mark suspect bail as paid and auto-release if applicable
        if payment.suspect:
            suspect = payment.suspect
            updated_fields = []
            if not suspect.bail_paid:
                suspect.bail_paid = True
                updated_fields.append('bail_paid')
            if suspect.status == SuspectStatus.IN_CUSTODY:
                suspect.status = SuspectStatus.RELEASED
                suspect.release_date = timezone.now()
                updated_fields.extend(['status', 'release_date'])
            if updated_fields:
                suspect.save(update_fields=updated_fields)

        frontend_base = getattr(settings, 'FRONTEND_BASE_URL', None)
        if frontend_base:
            return HttpResponseRedirect(
                f"{frontend_base}/payment-result?status=success"
                f"&payment_number={payment.payment_number}&ref_id={data.get('ref_id')}"
            )

        return Response(
            {
                'detail': 'Payment verified successfully.',
                'payment_number': payment.payment_number,
                'ref_id': data.get('ref_id'),
            },
            status=status.HTTP_200_OK,
        )