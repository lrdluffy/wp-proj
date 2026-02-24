from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import Case, CrimeScene, Complaint, CaseStatus, CrimeLevel, ComplaintStatus
import uuid
import re

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
        read_only_fields = ['case_number', 'created_at', 'updated_at', 'is_approved']


class CaseCreateSerializer(serializers.ModelSerializer):
    witnesses = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Case
        fields = ['title', 'description', 'crime_level', 'location', 'reported_at', 'notes', 'witnesses',
                  'plaintiffs_info']

    def validate_data_list(self, data_list, label):
        """اعتبارسنجی مشترک برای لیست شاهدان و شاکیان"""
        for item in data_list:
            if not re.match(r'^\d{10}$', str(item.get('national_id', ''))):
                raise serializers.ValidationError(f"کد ملی {item.get('name')} در لیست {label} معتبر نیست.")
            if not re.match(r'^09\d{9}$', str(item.get('phone', ''))):
                raise serializers.ValidationError(f"شماره تماس {item.get('name')} در لیست {label} معتبر نیست.")
        return data_list

    def create(self, validated_data):
        witnesses = validated_data.pop('witnesses', [])
        plaintiffs = validated_data.get('plaintiffs_info', [])

        self.validate_data_list(witnesses, "شاهدان")
        self.validate_data_list(plaintiffs, "شاکیان")

        user = self.context['request'].user
        validated_data['case_number'] = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        validated_data['created_by'] = user

        if user.role == 'POLICE_CHIEF':
            validated_data['is_approved'] = True

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