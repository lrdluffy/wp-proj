from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Case, CrimeScene
import uuid
import re

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role']


class CrimeSceneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeScene
        fields = '__all__'


class CaseSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserSimpleSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSimpleSerializer(source='created_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    crime_level_display = serializers.CharField(source='get_crime_level_display', read_only=True)
    crime_scene = CrimeSceneSerializer(read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ['case_number', 'created_at', 'updated_at']


class CaseCreateSerializer(serializers.ModelSerializer):
    witnesses = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Case
        fields = ['title', 'description', 'crime_level', 'location', 'reported_at', 'notes', 'witnesses']

    def validate_witnesses(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("لیست شاهدان باید به صورت آرایه باشد.")

        for w in value:
            if not re.match(r'^\d{10}$', str(w.get('national_id', ''))):
                raise serializers.ValidationError(f"کد ملی {w.get('name')} معتبر نیست.")
            if not re.match(r'^09\d{9}$', str(w.get('phone', ''))):
                raise serializers.ValidationError(f"شماره تماس {w.get('name')} معتبر نیست.")
        return value

    def create(self, validated_data):
        witnesses = validated_data.pop('witnesses', [])
        user = self.context['request'].user

        validated_data['case_number'] = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        validated_data['created_by'] = user
        validated_data['is_approved'] = (user.role == 'POLICE_CHIEF')

        case = Case.objects.create(**validated_data)

        CrimeScene.objects.create(
            case=case,
            location=validated_data.get('location', ''),
            description=validated_data.get('description', ''),
            occurred_at=validated_data.get('reported_at'),
            discovered_at=validated_data.get('reported_at'),
            witnesses_info=witnesses,
            discovered_by=user
        )
        return case