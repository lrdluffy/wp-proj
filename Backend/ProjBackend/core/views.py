from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts import permissions
from accounts.permissions import IsDetectiveOrHigher, IsOfficerOrHigher
from core.models import Case, CrimeScene, Complaint, ComplaintStatus
from core.serializers import (
    CaseSerializer, CaseCreateSerializer,
    CrimeSceneSerializer, ComplaintSerializer
)

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        description='List cases (paginated).',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('List example', value={'count':1,'next':None,'previous':None,'results':[{'id':1,'case_number':'CASE-1','title':'Burglary'}]}, response_only=True)]
    ),
    retrieve=extend_schema(
        description='Retrieve a case by id.',
        responses={200: CaseSerializer, 404: OpenApiResponse(description='Not found')},
        examples=[OpenApiExample('Retrieve example', value={'id':1,'case_number':'CASE-1','title':'Burglary','status':'PENDING'}, response_only=True)]
    ),
    create=extend_schema(
        description='Create a new case.',
        request=CaseCreateSerializer,
        responses={201: CaseSerializer, 400: OpenApiResponse(description='Validation error')},
        examples=[OpenApiExample('Create request', value={'title':'Burglary','description':'Break-in at 123 St'}, request_only=True), OpenApiExample('Create response', value={'id':1,'case_number':'CASE-1','title':'Burglary','status':'PENDING'}, response_only=True)]
    ),
    update=extend_schema(
        description='Replace a case.',
        request=CaseSerializer,
        responses={200: CaseSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    partial_update=extend_schema(
        description='Partially update a case.',
        request=CaseSerializer,
        responses={200: CaseSerializer, 400: OpenApiResponse(description='Validation error')},
    ),
    destroy=extend_schema(
        description='Delete a case.',
        responses={204: None, 404: OpenApiResponse(description='Not found')},
    ),
)
class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'crime_level', 'assigned_to', 'is_approved']  # فیلتر تایید اضافه شد
    search_fields = ['case_number', 'title', 'description']
    ordering_fields = ['created_at', 'reported_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'role') or user.role == 'CITIZEN':
            return Case.objects.none()

        # کارآموز فقط پرونده‌های تایید شده را ببیند
        if user.role == 'TRAINEE':
            return Case.objects.filter(is_approved=True)

        return Case.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CaseCreateSerializer
        return CaseSerializer

    def get_permissions(self):
        if self.action == 'retrieve':  # همان دکمه View
            return [IsAuthenticated()]  # موقتاً فقط چک کند لاگین است یا نه
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOfficerOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # منطق تایید خودکار در سریالایزر هندل شده است
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsOfficerOrHigher])
    @extend_schema(
        description='Approve a case (officers with sufficient rank).',
        responses={200: OpenApiTypes.OBJECT, 403: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('Approve response', value={'status': 'Case approved successfully'}, response_only=True)]
    )
    def approve(self, request, pk=None):
        """متد تایید پرونده توسط مافوق"""
        case = self.get_object()
        # فقط رده‌های بالاتر از افسر (مثلا سروان یا رئیس پلیس) یا خود سازنده اگر رئیس باشد
        if request.user.role in ['CAPTAIN', 'POLICE_CHIEF', 'SERGEANT']:
            case.is_approved = True
            case.save()
            return Response({'status': 'Case approved successfully'})
        return Response({'detail': 'You do not have permission to approve cases.'}, status=status.HTTP_403_FORBIDDEN)


@extend_schema_view(
    list=extend_schema(description='List complaints (paginated).', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve a complaint.', responses={200: ComplaintSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=ComplaintSerializer, responses={201: ComplaintSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=ComplaintSerializer, responses={200: ComplaintSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=ComplaintSerializer, responses={200: ComplaintSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'CITIZEN':
            return Complaint.objects.filter(citizen=user)
        return Complaint.objects.all()

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user, status=ComplaintStatus.PENDING)

    def perform_update(self, serializer):
        serializer.save(status=ComplaintStatus.PENDING)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @extend_schema(
        description='Trainee rejects a complaint and provides feedback.',
        request={
            'type': OpenApiTypes.OBJECT,
            'properties': {'feedback': {'type': 'string'}}
        },
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('Reject response', value={'status': 'Returned to citizen'}, response_only=True)]
    )
    def reject_by_trainee(self, request, pk=None):
        complaint = self.get_object()
        feedback = request.data.get('feedback', 'No feedback provided.')

        if complaint.rejection_count >= 2:
            complaint.status = ComplaintStatus.VOID
            complaint.trainee_feedback = f"Final Void: {feedback} (More than 3 errors)"
        else:
            complaint.status = ComplaintStatus.RETURNED_TO_CITIZEN
            complaint.rejection_count += 1
            complaint.trainee_feedback = feedback

        complaint.save()
        return Response({'status': 'Returned to citizen'})

    @action(detail=True, methods=['post'], permission_classes=[IsOfficerOrHigher])
    @extend_schema(
        description='Officer sends complaint back to trainee with feedback',
        request={
            'type': OpenApiTypes.OBJECT,
            'properties': {'feedback': {'type': 'string'}}
        },
        responses={200: OpenApiTypes.OBJECT},
    )
    def send_back_to_trainee(self, request, pk=None):
        complaint = self.get_object()
        feedback = request.data.get('feedback', 'Defect reported by officer')
        complaint.status = ComplaintStatus.PENDING
        complaint.trainee_feedback = f"Returned from officer: {feedback}"
        complaint.save()
        return Response({'status': 'Sent back to trainee'})

    @action(detail=True, methods=['post'], permission_classes=[IsOfficerOrHigher])
    def send_back_to_trainee_alt(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = ComplaintStatus.PENDING
        complaint.trainee_feedback = f"Defect reported by officer: {request.data.get('feedback')}"
        complaint.save()
        return Response({'status': 'Sent back to trainee'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def send_to_officer(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = ComplaintStatus.SENT_TO_OFFICER
        complaint.save()
        return Response({'status': 'Sent to officer for final approval'})

    @action(detail=True, methods=['post'], permission_classes=[IsOfficerOrHigher])
    @extend_schema(
        description='Approve a complaint and create a linked case.',
        responses={200: OpenApiTypes.OBJECT},
        examples=[OpenApiExample('Approve & create', value={'status': 'Approved', 'case_id': 123}, response_only=True)]
    )
    def approve_and_create_case(self, request, pk=None):
        complaint = self.get_object()
        import uuid

        new_case = Case.objects.create(
            case_number=f"CASE-{uuid.uuid4().hex[:8].upper()}",
            title=complaint.title,
            description=complaint.description,
            reported_at=complaint.created_at,
            created_by=request.user,
            status='PENDING',
            is_approved=(request.user.role == 'POLICE_CHIEF')  # تایید خودکار فقط برای رئیس
        )
        complaint.status = ComplaintStatus.APPROVED
        complaint.save()
        return Response({'status': 'Approved', 'case_id': new_case.id})


@extend_schema_view(
    list=extend_schema(description='List crime scenes.', responses={200: OpenApiTypes.OBJECT}),
    retrieve=extend_schema(description='Retrieve a crime scene.', responses={200: CrimeSceneSerializer, 404: OpenApiResponse(description='Not found')}),
    create=extend_schema(request=CrimeSceneSerializer, responses={201: CrimeSceneSerializer, 400: OpenApiResponse(description='Validation error')}),
    update=extend_schema(request=CrimeSceneSerializer, responses={200: CrimeSceneSerializer, 400: OpenApiResponse(description='Validation error')}),
    partial_update=extend_schema(request=CrimeSceneSerializer, responses={200: CrimeSceneSerializer, 400: OpenApiResponse(description='Validation error')}),
    destroy=extend_schema(responses={204: None, 404: OpenApiResponse(description='Not found')}),
)
class CrimeSceneViewSet(viewsets.ModelViewSet):
    queryset = CrimeScene.objects.all()
    serializer_class = CrimeSceneSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'discovered_by', 'processed_by']
    search_fields = ['location', 'description']
    ordering_fields = ['occurred_at', 'discovered_at', 'created_at']
    ordering = ['-created_at']