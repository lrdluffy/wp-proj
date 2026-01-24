from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from suspects.models import Suspect
from suspects.serializers import SuspectSerializer
from accounts.permissions import IsDetectiveOrHigher, IsOfficerOrHigher


class SuspectViewSet(viewsets.ModelViewSet):
    queryset = Suspect.objects.all()
    serializer_class = SuspectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'status', 'identified_by', 'interrogated_by']
    search_fields = ['first_name', 'last_name', 'national_id', 'phone_number']
    ordering_fields = ['created_at', 'identified_at', 'arrest_date']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDetectiveOrHigher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(identified_by=self.request.user)