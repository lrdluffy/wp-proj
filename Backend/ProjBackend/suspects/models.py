from django.db import models
from django.conf import settings
from core.models import Case


class SuspectStatus(models.TextChoices):
    IDENTIFIED = 'IDENTIFIED', 'Identified'
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', 'Under Investigation'
    INTERROGATED = 'INTERROGATED', 'Interrogated'
    CHARGED = 'CHARGED', 'Charged'
    AWAITING_TRIAL = 'AWAITING_TRIAL', 'Awaiting Trial'
    IN_CUSTODY = 'IN_CUSTODY', 'In Custody'
    RELEASED = 'RELEASED', 'Released'
    CLEARED = 'CLEARED', 'Cleared'


class Suspect(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='suspects'
    )

    first_name = models.CharField(max_length=63)
    last_name = models.CharField(max_length=63)
    date_of_birth = models.DateField(null=True, blank=True)
    national_id = models.CharField(max_length=31, null=True, blank=True)
    phone_number = models.CharField(max_length=31, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    # Physical description
    height = models.CharField(max_length=15, null=True, blank=True)
    weight = models.CharField(max_length=15, null=True, blank=True)
    eye_color = models.CharField(max_length=31, null=True, blank=True)
    hair_color = models.CharField(max_length=31, null=True, blank=True)
    distinguishing_marks = models.TextField(null=True, blank=True)

    # Photo
    photo = models.ImageField(upload_to='suspects/photos/', null=True, blank=True)

    # Status and processing
    status = models.CharField(
        max_length=31,
        choices=SuspectStatus.choices,
        default=SuspectStatus.IDENTIFIED
    )

    # Identification and investigation
    identified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='identified_suspects'
    )
    identified_at = models.DateTimeField(null=True, blank=True)

    # Interrogation
    interrogated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='interrogated_suspects'
    )
    interrogation_date = models.DateTimeField(null=True, blank=True)
    interrogation_notes = models.TextField(null=True, blank=True)
    interrogation_recording = models.FileField(
        upload_to='suspects/interrogations/',
        null=True,
        blank=True
    )

    # Charges
    charges = models.TextField(null=True, blank=True, help_text="Charges filed against the suspect")
    charged_date = models.DateTimeField(null=True, blank=True)

    # Custody
    arrest_date = models.DateTimeField(null=True, blank=True)
    release_date = models.DateTimeField(null=True, blank=True)
    bail_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    bail_paid = models.BooleanField(default=False)

    # Additional information
    prior_convictions = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Suspect'
        verbose_name_plural = 'Suspects'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.case.case_number}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_in_custody(self):
        return self.status == SuspectStatus.IN_CUSTODY