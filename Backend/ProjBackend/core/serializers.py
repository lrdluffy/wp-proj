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
    trials = serializers.SerializerMethodField()
    evidence_items = serializers.SerializerMethodField()

    evidence_items = serializers.SerializerMethodField()
    class Meta:
        model = Case
        fields = [
            'id', 'case_number', 'title', 'description', 'status', 'status_display',
            'crime_level', 'crime_level_display', 'location', 'reported_at',
            'is_approved', 'assigned_to', 'assigned_to_detail', 'created_by',
            'created_by_detail', 'notes', 'plaintiffs_info', 'crime_scene',
            'evidence_items', 'created_at', 'updated_at' ,'trials',
        ]
        read_only_fields = ['case_number', 'created_at', 'updated_at', 'is_approved']

    def get_evidence_items(self, obj):
        from evidence.serializers import EvidenceSerializer
        return EvidenceSerializer(obj.evidence_items.all(), many=True).data

    def get_trials(self, obj):
        from trials.serializers import TrialSerializer
        return TrialSerializer(obj.trials.all(), many=True).data


class CaseCreateSerializer(serializers.ModelSerializer):
    witnesses = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Case
        fields = [
            'title', 'description', 'crime_level', 'location',
            'reported_at', 'notes', 'witnesses', 'plaintiffs_info'
        ]

    def validate_data_list(self, data_list, label):
        if not isinstance(data_list, list):
            return data_list

        for item in data_list:
            name = item.get('name', 'نامشخص')
            national_id = str(item.get('national_id', ''))
            phone = str(item.get('phone', ''))

            if not re.match(r'^\d{10}$', national_id):
                raise serializers.ValidationError(f"کد ملی {name} در لیست {label} باید ۱۰ رقم باشد.")

            if not re.match(r'^09\d{9}$', phone):
                raise serializers.ValidationError(f"شماره تماس {name} در لیست {label} معتبر نیست (مثال: 09123456789).")

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