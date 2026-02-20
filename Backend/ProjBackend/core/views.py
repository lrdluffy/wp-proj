from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsDetectiveOrHigher, IsOfficerOrHigher
from core.models import Case, CrimeScene, Complaint, ComplaintStatus
from core.serializers import (
    CaseSerializer, CaseCreateSerializer,
    CrimeSceneSerializer, ComplaintSerializer
)


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'crime_level', 'assigned_to']
    search_fields = ['case_number', 'title', 'description']
    ordering_fields = ['created_at', 'reported_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return CaseCreateSerializer
        return CaseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsOfficerOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'CITIZEN':
            return Complaint.objects.filter(citizen=user)
        return Complaint.objects.all()

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject_by_trainee(self, request, pk=None):
        complaint = self.get_object()
        feedback = request.data.get('feedback', 'No feedback provided.')

        if complaint.rejection_count >= 2:
            complaint.status = ComplaintStatus.VOID
            complaint.trainee_feedback = f"Final Rejection: {feedback} (Case Voided due to 3 errors)"
        else:
            complaint.status = ComplaintStatus.RETURNED_TO_CITIZEN
            complaint.rejection_count += 1
            complaint.trainee_feedback = feedback

        complaint.save()
        return Response({'status': 'Returned to citizen or voided'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def send_to_officer(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = ComplaintStatus.SENT_TO_OFFICER
        complaint.save()
        return Response({'status': 'Sent to officer for final approval'})

    @action(detail=True, methods=['post'], permission_classes=[IsOfficerOrHigher])
    def approve_and_create_case(self, request, pk=None):
        complaint = self.get_object()
        import uuid

        # ساخت اتوماتیک پرونده از روی شکایت تایید شده
        new_case = Case.objects.create(
            case_number=f"CASE-{uuid.uuid4().hex[:8].upper()}",
            title=complaint.title,
            description=complaint.description,
            reported_at=complaint.created_at,
            created_by=request.user,
            status='PENDING'
        )

        complaint.status = ComplaintStatus.APPROVED
        complaint.save()

        return Response({'status': 'Approved', 'case_id': new_case.id})


class CrimeSceneViewSet(viewsets.ModelViewSet):
    queryset = CrimeScene.objects.all()
    serializer_class = CrimeSceneSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'discovered_by', 'processed_by']
    search_fields = ['location', 'description']
    ordering_fields = ['occurred_at', 'discovered_at', 'created_at']
    ordering = ['-created_at']