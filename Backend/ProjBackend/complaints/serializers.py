from rest_framework import serializers

from accounts.serializers import UserSerializer
from complaints.models import Complaint
from core.serializers import CaseSerializer


class ComplaintSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    related_case_detail = CaseSerializer(source='related_case', read_only=True)
    received_by_detail = UserSerializer(source='received_by', read_only=True)
    reviewed_by_detail = UserSerializer(source='reviewed_by', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_number', 'complainant_name', 'complainant_phone',
            'complainant_email', 'complainant_address', 'subject', 'description',
            'incident_date', 'incident_location', 'status', 'status_display',
            'related_case', 'related_case_detail', 'received_by', 'received_by_detail',
            'reviewed_by', 'reviewed_by_detail', 'review_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'complaint_number', 'complainant_name', 'complainant_phone',
            'complainant_email', 'complainant_address', 'subject', 'description',
            'incident_date', 'incident_location', 'received_by'
        ]