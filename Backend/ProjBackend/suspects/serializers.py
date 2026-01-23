from rest_framework import serializers

from accounts.serializers import UserSerializer
from core.serializers import CaseSerializer
from suspects.models import Suspect


class SuspectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.CharField(read_only=True)
    case_detail = CaseSerializer(source='case', read_only=True)
    identified_by_detail = UserSerializer(source='identified_by', read_only=True)
    interrogated_by_detail = UserSerializer(source='interrogated_by', read_only=True)
    is_in_custody = serializers.BooleanField(read_only=True)

    class Meta:
        model = Suspect
        fields = [
            'id', 'case', 'case_detail', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'national_id', 'phone_number', 'address',
            'height', 'weight', 'eye_color', 'hair_color', 'distinguishing_marks',
            'photo', 'status', 'status_display', 'identified_by', 'identified_by_detail',
            'identified_at', 'interrogated_by', 'interrogated_by_detail',
            'interrogation_date', 'interrogation_notes', 'interrogation_recording',
            'charges', 'charged_date', 'arrest_date', 'release_date',
            'bail_amount', 'bail_paid', 'prior_convictions', 'notes',
            'is_in_custody', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
