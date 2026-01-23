from django.db import models
from django.conf import settings
from core.models import Case


class ComplaintStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    CASE_CREATED = 'CASE_CREATED', 'Case Created'
    REJECTED = 'REJECTED', 'Rejected'
    CLOSED = 'CLOSED', 'Closed'


class Complaint(models.Model):
    complaint_number = models.CharField(max_length=127, unique=True)
    complainant_name = models.CharField(max_length=127)
    complainant_phone = models.CharField(max_length=31)
    complainant_email = models.EmailField(null=True, blank=True)
    complainant_address = models.TextField(null=True, blank=True)

    # Complaint details
    subject = models.CharField(max_length=127)
    description = models.TextField()
    incident_date = models.DateTimeField()
    incident_location = models.CharField(max_length=511)

    # Status and processing
    status = models.CharField(
        max_length=31,
        choices=ComplaintStatus.choices,
        default=ComplaintStatus.SUBMITTED
    )

    # Relationship to case (if one is created)
    related_case = models.ForeignKey(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints'
    )

    # Processing information
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_complaints'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_complaints'
    )
    review_notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def __str__(self):
        return f"{self.complaint_number} - {self.subject}"