from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from witnesses.models import WitnessStatement
from witnesses.serializers import WitnessStatementSerializer
from accounts.permissions import IsOfficerOrHigher


class WitnessStatementViewSet(viewsets.ModelViewSet):
    queryset = WitnessStatement.objects.all()
    serializer_class = WitnessStatementSerializer
    permission_classes = [IsAuthenticated, IsOfficerOrHigher]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['case', 'recorded_by', 'is_confidential', 'follow_up_required']
    search_fields = ['witness_name', 'witness_phone', 'witness_email', 'statement']
    ordering_fields = ['statement_date', 'created_at']
    ordering = ['-statement_date']

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)