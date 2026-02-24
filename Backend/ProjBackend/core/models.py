from django.db import models
from django.conf import settings
from django.utils import timezone


class CrimeLevel(models.IntegerChoices):
    LEVEL_1 = 1, 'Level 1'
    LEVEL_2 = 2, 'Level 2'
    LEVEL_3 = 3, 'Level 3'


class CaseStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', 'Under Investigation'
    AWAITING_TRIAL = 'AWAITING_TRIAL', 'Awaiting Trial'
    CLOSED = 'CLOSED', 'Closed'
    ARCHIVED = 'ARCHIVED', 'Archived'


class ComplaintStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    RETURNED_TO_CITIZEN = 'RETURNED', 'Returned for Correction'
    SENT_TO_OFFICER = 'SENT_TO_OFFICER', 'Sent to Officer'
    VOID = 'VOID', 'Voided (3 Strikes)'
    APPROVED = 'APPROVED', 'Converted to Case'


class Complaint(models.Model):
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='my_complaints'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=31,
        choices=ComplaintStatus.choices,
        default=ComplaintStatus.PENDING
    )
    rejection_count = models.PositiveIntegerField(
        default=0,
        help_text="Count of returns for corrections. Max is 3."
    )
    trainee_feedback = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Complaint: {self.title} by {self.citizen.username}"


class Case(models.Model):
    case_number = models.CharField(max_length=63, unique=True)
    title = models.CharField(max_length=127)
    description = models.TextField()
    crime_level = models.IntegerField(choices=CrimeLevel.choices, default=CrimeLevel.LEVEL_3)
    status = models.CharField(max_length=31, choices=CaseStatus.choices, default=CaseStatus.PENDING)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_cases'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_cases'
    )

    is_approved = models.BooleanField(
        default=False,
        help_text="Requires approval from a higher rank unless created by Chief."
    )

    plaintiffs_info = models.JSONField(
        default=list,
        blank=True,
        help_text="List of plaintiffs: [{'name': '', 'phone': '', 'national_id': ''}]"
    )

    reported_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=511, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.case_number} - {self.title}"


class CrimeScene(models.Model):
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='crime_scene',
        null=True,
        blank=True
    )
    location = models.CharField(max_length=511)
    description = models.TextField()
    occurred_at = models.DateTimeField()
    discovered_at = models.DateTimeField()

    witnesses_info = models.JSONField(
        default=list,
        help_text="List of witnesses: {'name': '', 'phone': '', 'national_id': ''}"
    )

    weather_conditions = models.CharField(max_length=255, null=True, blank=True)
    lighting_conditions = models.CharField(max_length=255, null=True, blank=True)
    scene_sketch = models.ImageField(upload_to='crime_scenes/sketches/', null=True, blank=True)
    scene_photos = models.JSONField(default=list)

    discovered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='discovered_scenes'
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_scenes'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Scene for Case: {self.case.case_number if self.case else 'Unassigned'}"