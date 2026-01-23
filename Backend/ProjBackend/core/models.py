from django.db import models

from ProjBackend import settings


class CrimeLevel(models.IntegerChoices):
    LEVEL_1 = 1, 'Level 1'  # Most severe
    LEVEL_2 = 2, 'Level 2'  # Moderate
    LEVEL_3 = 3, 'Level 3'  # Least severe


class CaseStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', 'Under Investigation'
    AWAITING_TRIAL = 'AWAITING_TRIAL', 'Awaiting Trial'
    CLOSED = 'CLOSED', 'Closed'
    ARCHIVED = 'ARCHIVED', 'Archived'


class Case(models.Model):
    case_number = models.CharField(
        max_length=63,
        unique=True
    )
    title = models.CharField(
        max_length=127
    )
    description = models.TextField()
    crime_level = models.IntegerField(
        choices=CrimeLevel.choices,
        default=CrimeLevel.LEVEL_3
    )
    status = models.CharField(
        max_length=31,
        choices=CaseStatus.choices,
        default=CaseStatus.PENDING
    )

    # Relationships
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_cases',
        help_text='Primary officer/detective assigned to this case',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_cases',
    )

    # Timestamps
    reported_at = models.DateTimeField(help_text="When the crime was reported")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # Additional information
    location = models.CharField(max_length=511, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Case'
        verbose_name_plural = 'Cases'

    def __str__(self):
        return f"{self.case_number} - {self.title}"

    @property
    def is_closed(self):
        return self.status == CaseStatus.CLOSED or self.status == CaseStatus.ARCHIVED


class CrimeScene(models.Model):
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='crime_scene',
        null=True,
        blank=True,
    )
    location = models.CharField(max_length=511)
    description = models.TextField()
    occurred_at = models.DateTimeField(help_text="When the crime occurred")
    discovered_at = models.DateTimeField(help_text="When the crime scene was discovered")

    # Scene details
    weather_conditions = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    lighting_conditions = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    scene_sketch = models.ImageField(
        upload_to='crime_scenes/sketches/',
        null=True,
        blank=True
    )
    scene_photos = models.JSONField(
        default=list,
        help_text="List of photo file paths"
    )

    # Relationships
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
        verbose_name = 'Crime Scene'
        verbose_name_plural = 'Crime Scenes'

    def __str__(self):
        return f"Crime Scene at {self.location}"
