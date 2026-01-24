from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
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

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)


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