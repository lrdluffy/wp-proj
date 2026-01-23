from django.db import models
from django.conf import settings
from core.models import Case


class WitnessStatement(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='witness_statements'
    )

    # Witness information
    witness_name = models.CharField(max_length=127)
    witness_phone = models.CharField(max_length=31, null=True, blank=True)
    witness_email = models.EmailField(null=True, blank=True)
    witness_address = models.TextField(null=True, blank=True)
    witness_id_number = models.CharField(max_length=127, null=True, blank=True)
    witness_age = models.IntegerField(null=True, blank=True)

    # Statement details
    statement = models.TextField(help_text="Witness's statement about the incident")
    statement_date = models.DateTimeField()
    statement_location = models.CharField(max_length=511, null=True, blank=True)

    # Relationship to incident
    relationship_to_case = models.CharField(
        max_length=127,
        null=True,
        blank=True,
        help_text="How the witness is related to the case (victim, bystander, etc.)"
    )

    # Processing
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_statements'
    )

    # Additional information
    is_confidential = models.BooleanField(
        default=False,
        help_text="Whether this witness statement should be kept confidential"
    )
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(null=True, blank=True)

    # Media
    statement_recording = models.FileField(
        upload_to='witness_statements/recordings/',
        null=True,
        blank=True
    )
    statement_transcript = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-statement_date']
        verbose_name = 'Witness Statement'
        verbose_name_plural = 'Witness Statements'

    def __str__(self):
        return f"Statement by {self.witness_name} - {self.case.case_number}"