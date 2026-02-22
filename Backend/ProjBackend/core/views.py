from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.utils import timezone
import os
import uuid
from datetime import datetime

from accounts.permissions import IsDetectiveOrHigher, IsOfficerOrHigher
from core.models import Case, CrimeScene
from core.serializers import CaseSerializer, CaseCreateSerializer, CrimeSceneSerializer
from evidence.models import Evidence, EvidenceType, EvidenceStatus


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
            return [IsDetectiveOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='upload-document')
    def upload_document(self, request, pk=None):
        """Upload a document to a case (creates evidence automatically)"""
        case = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        description = request.data.get('description', f'Document: {file.name}')
        
        # Generate unique filename
        file_ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        upload_path = os.path.join('evidence/documents', filename)
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        
        # Get relative URL for the file
        file_url = os.path.join(settings.MEDIA_URL, file_path).replace('\\', '/')
        
        # Generate evidence number
        evidence_count = Evidence.objects.filter(case=case).count()
        evidence_number = f"{case.case_number}-DOC-{evidence_count + 1:04d}"
        
        # Create evidence item
        evidence = Evidence.objects.create(
            evidence_number=evidence_number,
            case=case,
            evidence_type=EvidenceType.DOCUMENT,
            description=description,
            collected_at=timezone.now(),
            status=EvidenceStatus.COLLECTED,
            collected_by=request.user,
            documents=[{
                'name': file.name,
                'path': file_path,
                'url': file_url,
                'uploaded_at': datetime.now().isoformat(),
                'uploaded_by': request.user.id
            }]
        )
        
        return Response({
            'message': 'Document uploaded successfully',
            'evidence_id': evidence.id,
            'evidence_number': evidence.evidence_number,
            'file': {
                'name': file.name,
                'path': file_path,
                'url': file_url
            }
        }, status=status.HTTP_201_CREATED)

class CrimeSceneViewSet(viewsets.ModelViewSet):
    queryset = CrimeScene.objects.all()
    serializer_class = CrimeSceneSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'discovered_by', 'processed_by']
    search_fields = ['location', 'description']
    ordering_fields = ['occurred_at', 'discovered_at', 'created_at']
    ordering = ['-created_at']
