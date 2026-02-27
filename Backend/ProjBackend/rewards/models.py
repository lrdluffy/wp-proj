from django.db import models
from django.conf import settings
from decimal import Decimal
from core.models import Case


class RewardType(models.TextChoices):
    CASE_SOLVED = 'CASE_SOLVED', 'Case Solved'
    EXCELLENT_INVESTIGATION = 'EXCELLENT_INVESTIGATION', 'Excellent Investigation'
    SUSPECT_ARRESTED = 'SUSPECT_ARRESTED', 'Suspect Arrested'
    EVIDENCE_COLLECTED = 'EVIDENCE_COLLECTED', 'Key Evidence Collected'
    OTHER = 'OTHER', 'Other'


class RewardStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    PAID = 'PAID', 'Paid'
    REJECTED = 'REJECTED', 'Rejected'


class PaymentType(models.TextChoices):
    BAIL = 'BAIL', 'Bail Payment'
    FINE = 'FINE', 'Fine Payment'
    REWARD = 'REWARD', 'Reward Payment'
    OTHER = 'OTHER', 'Other'


class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PROCESSING = 'PROCESSING', 'Processing'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'


class Reward(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='rewards',
        null=True,
        blank=True
    )

    # Recipient
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rewards'
    )

    # Reward details
    reward_type = models.CharField(max_length=31, choices=RewardType.choices)
    description = models.TextField(help_text="Reason for the reward")
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Reward amount"
    )

    # Status
    status = models.CharField(
        max_length=15,
        choices=RewardStatus.choices,
        default=RewardStatus.PENDING
    )

    # Approval
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_rewards',
        limit_choices_to={'role__in': ['CAPTAIN', 'POLICE_CHIEF']}
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)

    # Payment
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=127, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Reward'
        verbose_name_plural = 'Rewards'

    def __str__(self):
        return f"Reward for {self.recipient.username} - {self.amount}"


class Payment(models.Model):
    payment_number = models.CharField(max_length=127, unique=True)

    # Payment details
    payment_type = models.CharField(max_length=15, choices=PaymentType.choices)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=15,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    # Related entities
    case = models.ForeignKey(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    reward = models.OneToOneField(
        Reward,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment'
    )
    suspect = models.ForeignKey(
        'suspects.Suspect',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )

    # Payer information
    payer_name = models.CharField(max_length=127)
    payer_email = models.EmailField(null=True, blank=True)
    payer_phone = models.CharField(max_length=31, null=True, blank=True)

    # Payment processing
    payment_method = models.CharField(
        max_length=31,
        null=True,
        blank=True,
        help_text="Payment gateway used (Zarinpal, IDPay, etc.)"
    )
    transaction_id = models.CharField(max_length=127, null=True, blank=True)
    payment_reference = models.CharField(
        max_length=127,
        null=True,
        blank=True,
        help_text="Gateway authority or reference code"
    )

    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Additional information
    description = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"{self.payment_number} - {self.amount} - {self.get_payment_type_display()}"