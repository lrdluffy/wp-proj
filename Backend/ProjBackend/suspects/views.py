from django.utils import timezone
from datetime import timedelta
import uuid

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import Role
from core.models import CrimeLevel, CaseStatus, Case
from suspects.models import Suspect, SuspectStatus
from suspects.serializers import SuspectSerializer
from trials.models import Trial, TrialStatus
from accounts.permissions import (
    IsDetectiveOrHigher,
    IsOfficerOrHigher,
    IsCaptainOrHigher,
    IsPoliceChief,
    IsSergeantOrHigher,
)


class SuspectViewSet(viewsets.ModelViewSet):
    queryset = Suspect.objects.all()
    serializer_class = SuspectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'status', 'identified_by', 'interrogated_by']
    search_fields = ['first_name', 'last_name', 'national_id', 'phone_number']
    ordering_fields = ['created_at', 'identified_at', 'arrest_date']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Suspect.objects.all()
        in_pursuit = self.request.query_params.get('in_pursuit', None)

        if in_pursuit == 'true':
            return queryset.filter(
                case__is_approved=True
            ).exclude(status=SuspectStatus.IN_CUSTODY)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDetectiveOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(identified_by=self.request.user)

    def _create_trial_for_suspect(self, suspect: Suspect):
        case: Case = suspect.case
        existing = Trial.objects.filter(case=case, suspect=suspect).first()
        if existing:
            return existing
        trial_number = f"TRIAL-{uuid.uuid4().hex[:8].upper()}"
        trial = Trial.objects.create(
            case=case,
            suspect=suspect,
            trial_number=trial_number,
            status=TrialStatus.SCHEDULED,
            scheduled_date=timezone.now() + timedelta(days=7),
            court_name="Criminal Court of Justice",
        )
        if case.status != CaseStatus.AWAITING_TRIAL:
            case.status = CaseStatus.AWAITING_TRIAL
            case.save(update_fields=['status'])
        return trial

    @action(detail=True, methods=['post'], permission_classes=[IsSergeantOrHigher])
    def arrest(self, request, pk=None):
        suspect = self.get_object()
        if suspect.status == SuspectStatus.IN_CUSTODY:
            return Response({'detail': 'Suspect is already in custody.'}, status=status.HTTP_400_BAD_REQUEST)
        if suspect.status in [SuspectStatus.RELEASED, SuspectStatus.CLEARED]:
            return Response({'detail': 'Cannot arrest a suspect who is released or cleared.'},
                            status=status.HTTP_400_BAD_REQUEST)
        suspect.status = SuspectStatus.IN_CUSTODY
        suspect.arrest_date = timezone.now()
        suspect.save()
        serializer = self.get_serializer(suspect)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsDetectiveOrHigher])
    def record_interrogation_score(self, request, pk=None):
        suspect = self.get_object()
        if not suspect.is_in_custody:
            return Response({'detail': 'Interrogation scoring is only allowed when the suspect is in custody.'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            probability = int(request.data.get('probability'))
        except (TypeError, ValueError):
            return Response({'detail': 'Probability must be an integer between 1 and 10.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if probability < 1 or probability > 10:
            return Response({'detail': 'Probability must be between 1 and 10.'}, status=status.HTTP_400_BAD_REQUEST)
        notes = request.data.get('notes', '')
        user = request.user
        if user.role == Role.SERGEANT:
            suspect.sergeant_probability = probability
            suspect.sergeant_notes = notes
            suspect.sergeant_officer = user
            suspect.sergeant_recorded_at = timezone.now()
        elif user.role == Role.DETECTIVE:
            suspect.detective_probability = probability
            suspect.detective_notes = notes
            suspect.detective_officer = user
            suspect.detective_recorded_at = timezone.now()
        else:
            return Response({'detail': 'Only detectives and sergeants can record interrogation scores.'},
                            status=status.HTTP_403_FORBIDDEN)
        suspect.save()
        serializer = self.get_serializer(suspect)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsCaptainOrHigher])
    def captain_decision(self, request, pk=None):
        suspect = self.get_object()
        if suspect.sergeant_probability is None or suspect.detective_probability is None:
            return Response(
                {'detail': 'Both sergeant and detective must record their probabilities before the captain decision.'},
                status=status.HTTP_400_BAD_REQUEST)
        try:
            final_probability = int(request.data.get('final_probability'))
        except (TypeError, ValueError):
            return Response({'detail': 'Final probability must be an integer between 1 and 10.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if final_probability < 1 or final_probability > 10:
            return Response({'detail': 'Final probability must be between 1 and 10.'},
                            status=status.HTTP_400_BAD_REQUEST)
        statement = (request.data.get('statement') or '').strip()
        if not statement:
            return Response({'detail': 'Statement is required.'}, status=status.HTTP_400_BAD_REQUEST)
        suspect.captain_probability = final_probability
        suspect.captain_statement = statement
        suspect.captain_officer = request.user
        suspect.captain_decided_at = timezone.now()
        suspect.save()
        case = suspect.case
        if case.crime_level != CrimeLevel.LEVEL_1:
            self._create_trial_for_suspect(suspect)
        serializer = self.get_serializer(suspect)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsPoliceChief])
    def chief_review(self, request, pk=None):
        suspect = self.get_object()
        case = suspect.case
        if case.crime_level != CrimeLevel.LEVEL_1:
            return Response({'detail': 'Chief review is only required for critical (level 1) crimes.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if suspect.captain_probability is None or suspect.captain_officer is None:
            return Response({'detail': 'Chief review is only possible after a captain decision has been recorded.'},
                            status=status.HTTP_400_BAD_REQUEST)
        approved = request.data.get('approved', None)
        if approved is None:
            return Response({'detail': 'Field "approved" is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(approved, str):
            approved_normalized = approved.lower()
            if approved_normalized in ['true', '1', 'yes']:
                approved_value = True
            elif approved_normalized in ['false', '0', 'no']:
                approved_value = False
            else:
                return Response({'detail': 'Field "approved" must be a boolean.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            approved_value = bool(approved)
        comment = request.data.get('comment', '')
        suspect.chief_approved = approved_value
        suspect.chief_comment = comment
        suspect.chief_officer = request.user
        suspect.chief_reviewed_at = timezone.now()
        suspect.save()
        if approved_value:
            self._create_trial_for_suspect(suspect)
        serializer = self.get_serializer(suspect)
        return Response(serializer.data, status=status.HTTP_200_OK)