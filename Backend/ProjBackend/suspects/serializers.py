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
    sergeant_officer_detail = UserSerializer(source='sergeant_officer', read_only=True)
    detective_officer_detail = UserSerializer(source='detective_officer', read_only=True)
    captain_officer_detail = UserSerializer(source='captain_officer', read_only=True)
    chief_officer_detail = UserSerializer(source='chief_officer', read_only=True)
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
            'sergeant_probability', 'sergeant_notes', 'sergeant_officer', 'sergeant_officer_detail',
            'sergeant_recorded_at',
            'detective_probability', 'detective_notes', 'detective_officer', 'detective_officer_detail',
            'detective_recorded_at',
            'captain_probability', 'captain_statement', 'captain_officer', 'captain_officer_detail',
            'captain_decided_at',
            'chief_approved', 'chief_comment', 'chief_officer', 'chief_officer_detail',
            'chief_reviewed_at',
            'charges', 'charged_date', 'arrest_date', 'release_date',
            'bail_amount', 'bail_paid', 'prior_convictions', 'notes',
            'is_in_custody', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'identified_by', 'identified_by_detail',
            'interrogated_by', 'interrogated_by_detail',
            'sergeant_officer', 'sergeant_officer_detail', 'sergeant_recorded_at',
            'detective_officer', 'detective_officer_detail', 'detective_recorded_at',
            'captain_officer', 'captain_officer_detail', 'captain_decided_at',
            'chief_officer', 'chief_officer_detail', 'chief_reviewed_at',
        ]
