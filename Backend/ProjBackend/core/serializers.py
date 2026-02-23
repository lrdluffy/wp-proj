from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Case, CrimeScene, Complaint, CaseStatus, CrimeLevel, ComplaintStatus

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role']
        read_only_fields = fields

class ComplaintSerializer(serializers.ModelSerializer):
    citizen_detail = UserSimpleSerializer(source='citizen', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'citizen_detail', 'title', 'description',
            'status', 'status_display', 'rejection_count',
            'trainee_feedback', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'rejection_count', 'trainee_feedback', 'created_at', 'updated_at']

class CaseSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserSimpleSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSimpleSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    crime_level_display = serializers.CharField(source='get_crime_level_display', read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ['case_number', 'created_at', 'updated_at']

class CaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['title', 'description', 'crime_level', 'location', 'reported_at', 'notes']

    def create(self, validated_data):
        import uuid
        validated_data['case_number'] = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)

class CrimeSceneSerializer(serializers.ModelSerializer):
    discovered_by_detail = UserSimpleSerializer(source='discovered_by', read_only=True)
    processed_by_detail = UserSimpleSerializer(source='processed_by', read_only=True)

    class Meta:
        model = CrimeScene
        fields = '__all__'