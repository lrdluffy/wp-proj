from django.contrib.auth.models import AbstractUser
from django.db import models



class Role(models.TextChoices):
    TRAINEE = 'TRAINEE', 'Trainee'
    MEDICAL_EXAMINER = 'MEDICAL_EXAMINER', 'Medical Examiner'
    POLICE_OFFICER = 'POLICE_OFFICER', 'Police Officer'
    PATROL_OFFICER = 'PATROL_OFFICER', 'Patrol Officer'
    DETECTIVE = 'DETECTIVE', 'Detective'
    SERGEANT = 'SERGEANT', 'Sergeant'
    CAPTAIN = 'CAPTAIN', 'Captain'
    POLICE_CHIEF = 'POLICE_CHIEF', 'Police Chief'


class User(AbstractUser):
    role = models.CharField(
        max_length=31,
        choices=Role.choices,
        default=Role.TRAINEE,
        help_text="User's role/rank in the police department"
    )
    badge_number = models.CharField(
        max_length=63,
        unique=True,
        null=True,
        blank=True,
        help_text="Police badge number"
    )
    phone_number = models.CharField(
        max_length=31,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    def is_trainee(self):
        return self.role == Role.TRAINEE

    def is_medical_examiner(self):
        return self.role == Role.MEDICAL_EXAMINER

    def is_officer(self):
        return self.role in [Role.POLICE_OFFICER, Role.PATROL_OFFICER]

    def is_detective(self):
        return self.role == Role.DETECTIVE

    def is_sergeant(self):
        return self.role == Role.SERGEANT

    def is_captain(self):
        return self.role == Role.CAPTAIN

    def is_chief(self):
        return self.role == Role.POLICE_CHIEF

    def can_handle_crime_level(self, level):
        # Check if user can handle crimes of a certain level
        level_permissions = {
            1: [Role.POLICE_CHIEF, Role.CAPTAIN],
            2: [Role.CAPTAIN, Role.SERGEANT, Role.DETECTIVE],
            3: [Role.SERGEANT, Role.DETECTIVE, Role.POLICE_OFFICER, Role.PATROL_OFFICER],
        }

        return self.role in level_permissions.get(level, [])