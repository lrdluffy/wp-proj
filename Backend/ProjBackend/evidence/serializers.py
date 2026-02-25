import json
from rest_framework import serializers
from accounts.serializers import UserSerializer
from evidence.models import Evidence, BiologicalEvidence, MedicalEvidence, VehicleEvidence, IdentificationEvidence

class CaseMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    case_number = serializers.CharField()
    title = serializers.CharField()


class EvidenceSerializer(serializers.ModelSerializer):
    evidence_type_display = serializers.CharField(source='get_evidence_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_detail = CaseMinimalSerializer(source='case', read_only=True)
    collected_by_detail = UserSerializer(source='collected_by', read_only=True)
    analyzed_by_detail = UserSerializer(source='analyzed_by', read_only=True)

    photos = serializers.SerializerMethodField()

    uploaded_files = serializers.ListField(
        child=serializers.FileField(allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Evidence
        fields = [
            'id', 'evidence_number', 'case', 'case_detail', 'evidence_type',
            'evidence_type_display', 'description', 'location_found',
            'collected_at', 'status', 'status_display', 'storage_location',
            'chain_of_custody', 'collected_by', 'collected_by_detail',
            'analyzed_by', 'analyzed_by_detail', 'uploaded_files', 'photos'
        ]
        read_only_fields = ['id']

    def get_photos(self, obj):
        request = self.context.get('request')
        if obj.photos and hasattr(obj.photos, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.photos.url)
            return obj.photos.url
        return None

    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        request = self.context.get('request')
        evidence_type = validated_data.get('evidence_type')

        model_map = {
            'VEHICLE': VehicleEvidence,
            'BIOLOGICAL': BiologicalEvidence,
            'MEDICAL': MedicalEvidence,
            'IDENTIFICATION': IdentificationEvidence,
        }
        ModelClass = model_map.get(evidence_type, Evidence)

        allowed_fields = [f.name for f in ModelClass._meta.get_fields()]
        final_validated_data = {
            k: v for k, v in validated_data.items()
            if k in allowed_fields and k not in ['photos', 'documents']
        }

        if request and hasattr(request, 'user'):
            final_validated_data['collected_by'] = request.user

        extra_kwargs = {}
        if evidence_type == 'VEHICLE':
            for f in ['vehicle_license_plate', 'vehicle_model', 'vehicle_color', 'vin_number']:
                val = request.data.get(f)
                if val: extra_kwargs[f] = val
        elif evidence_type == 'IDENTIFICATION':
            extra_kwargs['document_type'] = request.data.get('document_type')
            extra_kwargs['document_number'] = request.data.get('document_number')
            extra_kwargs['extra_details'] = {}

        instance = ModelClass.objects.create(**final_validated_data, **extra_kwargs)

        if uploaded_files:
            try:
                file_obj = uploaded_files[0]
                instance.photos.save(file_obj.name, file_obj, save=True)
            except Exception as e:
                print(f"File Save Error: {e}")

        return instance

class EvidenceDetailSerializer(serializers.ModelSerializer):
    collected_by_name = serializers.CharField(source='collected_by.get_full_name', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    specific_data = serializers.SerializerMethodField()

    class Meta:
        model = Evidence
        fields = '__all__'

    def get_specific_data(self, obj):
        if hasattr(obj, 'vehicleevidence'):
            v = obj.vehicleevidence
            return {
                'subtype': 'VEHICLE',
                'plate': v.vehicle_license_plate,
                'vin': v.vin_number,
                'model': v.vehicle_model,
                'color': v.vehicle_color
            }
        if hasattr(obj, 'identificationevidence'):
            i = obj.identificationevidence
            return {
                'subtype': 'IDENTIFICATION',
                'doc_type': i.document_type,
                'doc_number': i.document_number,
                'extra': i.extra_details
            }
        if hasattr(obj, 'biologicalevidence'):
            b = obj.biologicalevidence
            return {
                'subtype': 'BIOLOGICAL',
                'sample': b.sample_type,
                'lab_ref': b.lab_reference_number,
                'result': getattr(obj, 'analysis_results', None)
            }
        return None

class BiologicalEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = BiologicalEvidence
        fields = EvidenceSerializer.Meta.fields + ['sample_type', 'lab_reference_number']

class MedicalEvidenceSerializer(EvidenceSerializer):
    examiner_detail = UserSerializer(source='examiner', read_only=True)
    class Meta(EvidenceSerializer.Meta):
        model = MedicalEvidence
        fields = EvidenceSerializer.Meta.fields + ['examiner', 'examiner_detail', 'examination_date', 'medical_report']

class VehicleEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = VehicleEvidence
        fields = EvidenceSerializer.Meta.fields + ['vehicle_license_plate', 'vehicle_make', 'vehicle_model', 'vehicle_color', 'vin_number']

class IdentificationEvidenceSerializer(EvidenceSerializer):
    class Meta(EvidenceSerializer.Meta):
        model = IdentificationEvidence
        fields = EvidenceSerializer.Meta.fields + ['document_type', 'document_number', 'issued_by', 'issue_date', 'expiry_date', 'extra_details']