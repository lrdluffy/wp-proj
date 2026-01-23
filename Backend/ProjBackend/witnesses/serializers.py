from rest_framework import serializers

from accounts.serializers import UserSerializer
from core.serializers import CaseSerializer
from witnesses.models import WitnessStatement

class WitnessStatementSerializer(serializers.ModelSerializer):
    case_detail = CaseSerializer(source='case', read_only=True)
    recorded_by_detail = UserSerializer(source='recorded_by', read_only=True)

    class Meta:
        model = WitnessStatement
        fields = [
            'id', 'case', 'case_detail', 'witness_name', 'witness_phone',
            'witness_email', 'witness_address', 'witness_id_number',
            'witness_age', 'statement', 'statement_date', 'statement_location',
            'relationship_to_case', 'recorded_by', 'recorded_by_detail',
            'is_confidential', 'follow_up_required', 'follow_up_notes',
            'statement_recording', 'statement_transcript',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
