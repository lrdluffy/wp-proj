from django.db import models
from django.conf import settings
from core.models import Case
from suspects.models import Suspect


class TrialStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    ADJOURNED = 'ADJOURNED', 'Adjourned'
    COMPLETED = 'COMPLETED', 'Completed'
    DISMISSED = 'DISMISSED', 'Dismissed'
    POSTPONED = 'POSTPONED', 'Postponed'


class Verdict(models.TextChoices):
    GUILTY = 'GUILTY', 'Guilty'
    NOT_GUILTY = 'NOT_GUILTY', 'Not Guilty'
    PENDING = 'PENDING', 'Pending'
    MISTRIAL = 'MISTRIAL', 'Mistrial'


class Trial(models.Model):
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='trials'
    )
    suspect = models.ForeignKey(
        Suspect,
        on_delete=models.CASCADE,
        related_name='trials'
    )

    # Trial information
    trial_number = models.CharField(max_length=127, unique=True)
    status = models.CharField(
        max_length=15,
        choices=TrialStatus.choices,
        default=TrialStatus.SCHEDULED
    )

    # Scheduling
    scheduled_date = models.DateTimeField()
    started_date = models.DateTimeField(null=True, blank=True)
    completed_date = models.DateTimeField(null=True, blank=True)

    # Court information
    court_name = models.CharField(max_length=127)
    court_location = models.CharField(max_length=255, null=True, blank=True)
    judge_name = models.CharField(max_length=127, null=True, blank=True)

    # Prosecution and defense
    prosecutor_name = models.CharField(max_length=127, null=True, blank=True)
    defense_attorney_name = models.CharField(max_length=127, null=True, blank=True)

    # Outcome
    verdict = models.CharField(
        max_length=15,
        choices=Verdict.choices,
        null=True,
        blank=True
    )
    sentence = models.TextField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    fine_paid = models.BooleanField(default=False)

    # Additional information
    trial_notes = models.TextField(null=True, blank=True)
    case_summary = models.TextField(null=True, blank=True)

    # Relationships
    attended_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='attended_trials',
        blank=True,
        help_text="Police officers who attended the trial"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date']
        verbose_name = 'Trial'
        verbose_name_plural = 'Trials'

    def __str__(self):
        return f"{self.trial_number} - {self.case.case_number} - {self.suspect.full_name}"

    @property
    def is_completed(self):
        return self.status == TrialStatus.COMPLETED