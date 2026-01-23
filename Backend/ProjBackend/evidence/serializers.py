from rest_framework import serializers

from accounts.serializers import UserSerializer
from core.serializers import CaseSerializer
from evidence.models import Evidence, BiologicalEvidence, MedicalEvidence, VehicleEvidence, IdentificationEvidence


class EvidenceSerializer(serializers.ModelSerializer):
    evidence_type_display = serializers.CharField(source='get_evidence_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_detail = CaseSerializer(source='case', read_only=True)
    collected_by_detail = UserSerializer(source='collected_by', read_only=True)
    analyzed_by_detail = UserSerializer(source='analyzed_by', read_only=True)

    class Meta:
        model = Evidence
        fields = [
            'id', 'evidence_number', 'case', 'case_detail', 'evidence_type',
            'evidence_type_display', 'description', 'location_found',
            'collected_at', 'status', 'status_display', 'photos', 'documents',
            'storage_location', 'chain_of_custody', 'collected_by',
            'collected_by_detail', 'analyzed_by', 'analyzed_by_detail',
            'analysis_results', 'analysis_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BiologicalEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = BiologicalEvidence
        fields = EvidenceSerializer.Meta.fields + ['sample_type', 'lab_reference_number']


class MedicalEvidenceSerializer(EvidenceSerializer):
    examiner_detail = UserSerializer(source='examiner', read_only=True)

    class Meta(EvidenceSerializer.Meta):
        model = MedicalEvidence
        fields = EvidenceSerializer.Meta.fields + [
            'examiner', 'examiner_detail', 'examination_date', 'medical_report'
        ]


class VehicleEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = VehicleEvidence
        fields = EvidenceSerializer.Meta.fields + [
            'vehicle_license_plate', 'vehicle_make', 'vehicle_model',
            'vehicle_color', 'vin_number'
        ]


class IdentificationEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = IdentificationEvidence
        fields = EvidenceSerializer.Meta.fields + [
            'document_type', 'document_number', 'issued_by',
            'issue_date', 'expiry_date'
        ]
