from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsOfficerOrHigher
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer, ComplaintCreateSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'received_by', 'reviewed_by']
    search_fields = ['complaint_number', 'subject', 'complaint_name', 'description']
    ordering_fields = ['created_at', 'incident_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOfficerOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(recived_by=self.request.user)