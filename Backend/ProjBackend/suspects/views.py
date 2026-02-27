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
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        description='List suspects (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count':1,'next':None,'previous':None,'results':[{'id':1,'first_name':'John','last_name':'Doe','status':'SUSPECTED'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve a suspect by id.',
        responses={200: SuspectSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Retrieve example', value={'id':1,'first_name':'John','last_name':'Doe','status':'IN_CUSTODY'}, response_only=True)]
    ),
    create=extend_schema(
        description='Create a new suspect record.',
        request=SuspectSerializer,
        responses={201: SuspectSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[OpenApiExample('Create request', value={'first_name':'John','last_name':'Doe','national_id':'123456789'}, request_only=True), OpenApiExample('Create response', value={'id':1,'first_name':'John','last_name':'Doe'}, response_only=True)]
    ),
    update=extend_schema(
        description='Replace a suspect record.',
        request=SuspectSerializer,
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    partial_update=extend_schema(
        description='Partially update a suspect record.',
        request=SuspectSerializer,
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    destroy=extend_schema(
        description='Delete a suspect record.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
    ),
)
@extend_schema(tags=['Suspects'], description='Manage suspects and interrogation workflow')
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

    arrest = extend_schema(
        description='Mark a suspect as arrested',
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Bad request')},
        examples=[
            OpenApiExample('Arrest success', value={'id':1,'status':'IN_CUSTODY'}, response_only=True),
            OpenApiExample('Arrest error', value={'detail':'Suspect is already in custody.'}, response_only=True),
        ]
    )(arrest)

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

    record_interrogation_score = extend_schema(
        description='Record interrogation probability score for a suspect',
        request={
            'type': OpenApiTypes.OBJECT,
            'properties': {'probability': {'type': 'integer'}, 'notes': {'type': 'string'}}
        },
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Bad request')},
        examples=[
            OpenApiExample('Record success', value={'id':1,'detective_probability':7,'sergeant_probability':6}, response_only=True),
            OpenApiExample('Record error', value={'detail':'Probability must be between 1 and 10.'}, response_only=True),
        ]
    )(record_interrogation_score)

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

    captain_decision = extend_schema(
        description='Captain makes final probability decision and statement',
        request={
            'type': OpenApiTypes.OBJECT,
            'properties': {'final_probability': {'type': 'integer'}, 'statement': {'type': 'string'}}
        },
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Bad request')},
        examples=[
            OpenApiExample('Captain decision success', value={'id':1,'captain_probability':8,'captain_statement':'Proceed to trial'}, response_only=True),
            OpenApiExample('Captain decision error', value={'detail':'Statement is required.'}, response_only=True),
        ]
    )(captain_decision)

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

    chief_review = extend_schema(
        description='Chief reviews captain decision for level 1 crimes',
        request={
            'type': OpenApiTypes.OBJECT,
            'properties': {'approved': {'type': 'boolean'}, 'comment': {'type': 'string'}}
        },
        responses={200: SuspectSerializer, 400: OpenApiResponse(description='Bad request')},
        examples=[
            OpenApiExample('Chief approved', value={'id':1,'chief_approved':True,'chief_comment':'Approved for trial'}, response_only=True),
            OpenApiExample('Chief error', value={'detail':'Field "approved" is required.'}, response_only=True),
        ]
    )(chief_review)