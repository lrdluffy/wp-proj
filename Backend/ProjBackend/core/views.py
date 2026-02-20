from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsDetectiveOrHigher, IsOfficerOrHigher
from core.models import Case, CrimeScene
from core.serializers import CaseSerializer, CaseCreateSerializer, CrimeSceneSerializer


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
        if self.action == 'create':
            return [IsOfficerOrHigher()]

        elif self.action in ['update', 'partial_update']:
            return [IsOfficerOrHigher()]

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CrimeSceneViewSet(viewsets.ModelViewSet):
    queryset = CrimeScene.objects.all()
    serializer_class = CrimeSceneSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'discovered_by', 'processed_by']
    search_fields = ['location', 'description']
    ordering_fields = ['occurred_at', 'discovered_at', 'created_at']
    ordering = ['-created_at']
