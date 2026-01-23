from django.db import models
from django.conf import settings
from core.models import Case


class EvidenceType(models.TextChoices):
    BIOLOGICAL = 'BIOLOGICAL', 'Biological Evidence'
    MEDICAL = 'MEDICAL', 'Medical Evidence'
    VEHICLE = 'VEHICLE', 'Vehicle Evidence'
    IDENTIFICATION = 'IDENTIFICATION', 'Identification Documents'
    DOCUMENT = 'DOCUMENT', 'Document Evidence'
    PHOTOGRAPH = 'PHOTOGRAPH', 'Photograph'
    VIDEO = 'VIDEO', 'Video Recording'
    AUDIO = 'AUDIO', 'Audio Recording'
    FINGERPRINT = 'FINGERPRINT', 'Fingerprint'
    DNA = 'DNA', 'DNA Sample'
    WEAPON = 'WEAPON', 'Weapon'
    OTHER = 'OTHER', 'Other'


class EvidenceStatus(models.TextChoices):
    COLLECTED = 'COLLECTED', 'Collected'
    IN_ANALYSIS = 'IN_ANALYSIS', 'In Analysis'
    ANALYZED = 'ANALYZED', 'Analyzed'
    STORED = 'STORED', 'Stored'
    DISPOSED = 'DISPOSED', 'Disposed'


class Evidence(models.Model):
    evidence_number = models.CharField(max_length=127, unique=True)
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='evidence_items'
    )

    # Evidence details
    evidence_type = models.CharField(max_length=31, choices=EvidenceType.choices)
    description = models.TextField()
    location_found = models.CharField(max_length=511, null=True, blank=True)
    collected_at = models.DateTimeField()

    # Evidence handling
    status = models.CharField(
        max_length=31,
        choices=EvidenceStatus.choices,
        default=EvidenceStatus.COLLECTED
    )

    # Files and media
    photos = models.JSONField(
        default=list,
        help_text="List of photo file paths"
    )
    documents = models.JSONField(
        default=list,
        help_text="List of document file paths"
    )

    # Storage information
    storage_location = models.CharField(max_length=255, null=True, blank=True)
    chain_of_custody = models.JSONField(
        default=list,
        help_text="List of custody transfers with timestamps and officers"
    )

    # Relationships
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='collected_evidence'
    )
    analyzed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='analyzed_evidence'
    )

    # Analysis results
    analysis_results = models.TextField(null=True, blank=True)
    analysis_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Evidence'
        verbose_name_plural = 'Evidence'

    def __str__(self):
        return f"{self.evidence_number} - {self.get_evidence_type_display()}"


# Specific evidence models for detailed tracking
class BiologicalEvidence(Evidence):
    """Biological evidence (DNA, blood, etc.)"""
    sample_type = models.CharField(max_length=127)  # blood, hair, saliva, etc.
    lab_reference_number = models.CharField(max_length=127, null=True, blank=True)

    class Meta:
        verbose_name = 'Biological Evidence'
        verbose_name_plural = 'Biological Evidence'


class MedicalEvidence(Evidence):
    """Medical/forensic evidence"""
    examiner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'MEDICAL_EXAMINER'},
        related_name='medical_examinations'
    )
    examination_date = models.DateTimeField(null=True, blank=True)
    medical_report = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = 'Medical Evidence'
        verbose_name_plural = 'Medical Evidence'


class VehicleEvidence(Evidence):
    """Vehicle-related evidence"""
    vehicle_license_plate = models.CharField(max_length=63, null=True, blank=True)
    vehicle_make = models.CharField(max_length=127, null=True, blank=True)
    vehicle_model = models.CharField(max_length=127, null=True, blank=True)
    vehicle_color = models.CharField(max_length=31, null=True, blank=True)
    vin_number = models.CharField(max_length=63, null=True, blank=True)

    class Meta:
        verbose_name = 'Vehicle Evidence'
        verbose_name_plural = 'Vehicle Evidence'


class IdentificationEvidence(Evidence):
    """Identification documents evidence"""
    document_type = models.CharField(max_length=127)  # ID card, passport, driver's license, etc.
    document_number = models.CharField(max_length=127, null=True, blank=True)
    issued_by = models.CharField(max_length=127, null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Identification Evidence'
        verbose_name_plural = 'Identification Evidence'