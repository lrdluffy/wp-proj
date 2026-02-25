from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
import uuid
from datetime import datetime
from evidence.models import Evidence, BiologicalEvidence, MedicalEvidence, VehicleEvidence, IdentificationEvidence
from evidence.serializers import (
    EvidenceSerializer, BiologicalEvidenceSerializer, MedicalEvidenceSerializer,
    VehicleEvidenceSerializer, IdentificationEvidenceSerializer
)
from accounts.permissions import IsOfficerOrHigher


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'evidence_type', 'status', 'collected_by']
    search_fields = ['evidence_number', 'description', 'location_found']
    ordering_fields = ['collected_at', 'created_at']
    ordering = ['-created_at']

    # در views.py
    def perform_create(self, serializer):
        # فقط سیو خالی، چون یوزر رو توی سریالایزر هندل کردیم
        serializer.save()

    @action(detail=True, methods=['post'], url_path='upload-document')
    def upload_document(self, request, pk=None):
        """Upload a document file to evidence"""
        evidence = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Generate unique filename
        file_ext = os.path.splitext(file.name)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        upload_path = os.path.join('evidence/documents', filename)
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        
        # Get relative URL for the file
        file_url = os.path.join(settings.MEDIA_URL, file_path).replace('\\', '/')
        
        # Add to evidence documents list
        documents = evidence.documents or []
        documents.append({
            'name': file.name,
            'path': file_path,
            'url': file_url,
            'uploaded_at': datetime.now().isoformat(),
            'uploaded_by': request.user.id
        })
        evidence.documents = documents
        evidence.save()
        
        return Response({
            'message': 'Document uploaded successfully',
            'file': {
                'name': file.name,
                'path': file_path,
                'url': file_url
            }
        }, status=status.HTTP_201_CREATED)


class BiologicalEvidenceViewSet(viewsets.ModelViewSet):
    queryset = BiologicalEvidence.objects.all()
    serializer_class = BiologicalEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status']
    search_fields = ['evidence_number', 'sample_type', 'lab_reference_number']


class MedicalEvidenceViewSet(viewsets.ModelViewSet):
    queryset = MedicalEvidence.objects.all()
    serializer_class = MedicalEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status', 'examiner']
    search_fields = ['evidence_number', 'description']


class VehicleEvidenceViewSet(viewsets.ModelViewSet):
    queryset = VehicleEvidence.objects.all()
    serializer_class = VehicleEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status']
    search_fields = ['evidence_number', 'vehicle_license_plate', 'vin_number']


class IdentificationEvidenceViewSet(viewsets.ModelViewSet):
    queryset = IdentificationEvidence.objects.all()
    serializer_class = IdentificationEvidenceSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['case', 'status', 'document_type']
    search_fields = ['evidence_number', 'document_number']