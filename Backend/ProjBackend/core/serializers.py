from rest_framework import serializers
import uuid
from accounts.serializers import UserSerializer
from core.models import Case, CrimeScene

class CaseSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    crime_level_display = serializers.CharField(source='get_crime_level_display', read_only=True)
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    is_closed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'description', 'crime_level',
            'crime_level_display', 'status', 'status_display', 'assigned_to',
            'assigned_to_detail', 'created_by', 'created_by_detail',
            'reported_at', 'created_at', 'updated_at', 'closed_at',
            'location', 'notes', 'is_closed'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            'case_number', 'title', 'description', 'crime_level',
            'status', 'assigned_to', 'reported_at', 'location', 'notes'
        ]
        read_only_fields = ['case_number']

    def create(self, validated_data):
        if not validated_data.get('case_number'):
            validated_data['case_number'] = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)

class CrimeSceneSerializer(serializers.ModelSerializer):
    case_detail = CaseSerializer(source='case', read_only=True)
    discovered_by_detail = UserSerializer(source='discovered_by', read_only=True)
    processed_by_detail = UserSerializer(source='processed_by', read_only=True)

    class Meta:
        model = CrimeScene
        fields = [
            'id', 'case', 'case_detail', 'location', 'description',
            'occurred_at', 'discovered_at', 'weather_conditions',
            'lighting_conditions', 'scene_sketch', 'scene_photos',
            'discovered_by', 'discovered_by_detail', 'processed_by',
            'processed_by_detail', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']