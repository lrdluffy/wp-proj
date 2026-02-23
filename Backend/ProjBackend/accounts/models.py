from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.TextChoices):
    CITIZEN = 'CITIZEN', 'Citizen'
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
        default=Role.CITIZEN,
        help_text="User's role/rank in the department or citizen status"
    )
    badge_number = models.CharField(
        max_length=63,
        unique=True,
        null=True,
        blank=True,
        help_text="Police badge number (Only for police personnel)"
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

    def is_citizen(self):
        return self.role == Role.CITIZEN

    def is_trainee(self):
        return self.role == Role.TRAINEE

    def is_officer(self):
        return self.role in [Role.POLICE_OFFICER, Role.PATROL_OFFICER]

    def is_higher_rank(self):
        return self.role in [Role.DETECTIVE, Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF]

    def can_handle_crime_level(self, level):
        level_permissions = {
            1: [Role.POLICE_CHIEF, Role.CAPTAIN],
            2: [Role.CAPTAIN, Role.SERGEANT, Role.DETECTIVE],
            3: [Role.SERGEANT, Role.DETECTIVE, Role.POLICE_OFFICER, Role.PATROL_OFFICER],
        }
        return self.role in level_permissions.get(level, [])