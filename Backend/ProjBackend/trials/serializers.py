from rest_framework import serializers

from accounts.serializers import UserSerializer
from core.serializers import CaseSerializer
from suspects.serializers import SuspectSerializer
from trials.models import Trial


class TrialSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    verdict_display = serializers.CharField(source='get_verdict_display', read_only=True)
    case_detail = CaseSerializer(source='case', read_only=True)
    suspect_detail = SuspectSerializer(source='suspect', read_only=True)
    attended_by_detail = UserSerializer(source='attended_by', many=True, read_only=True)
    is_completed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Trial
        fields = [
            'id', 'case', 'case_detail', 'suspect', 'suspect_detail',
            'trial_number', 'status', 'status_display', 'scheduled_date',
            'started_date', 'completed_date', 'court_name', 'court_location',
            'judge_name', 'prosecutor_name', 'defense_attorney_name',
            'verdict', 'verdict_display', 'sentence', 'fine_amount',
            'fine_paid', 'trial_notes', 'case_summary', 'attended_by_detail',
            'attended_by_detail', 'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
