from django.contrib import admin
from .models import Evidence, BiologicalEvidence, MedicalEvidence, VehicleEvidence, IdentificationEvidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ('evidence_number', 'case', 'evidence_type', 'status', 'collected_by', 'collected_at')
    list_filter = ('evidence_type', 'status', 'collected_at', 'collected_by')
    search_fields = ('evidence_number', 'description', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'collected_at'


@admin.register(BiologicalEvidence)
class BiologicalEvidenceAdmin(admin.ModelAdmin):
    list_display = ('evidence_number', 'case', 'sample_type', 'status', 'lab_reference_number')
    list_filter = ('sample_type', 'status')


@admin.register(MedicalEvidence)
class MedicalEvidenceAdmin(admin.ModelAdmin):
    list_display = ('evidence_number', 'case', 'examiner', 'examination_date', 'status')
    list_filter = ('examination_date', 'status', 'examiner')


@admin.register(VehicleEvidence)
class VehicleEvidenceAdmin(admin.ModelAdmin):
    list_display = ('evidence_number', 'case', 'vehicle_license_plate', 'vehicle_make', 'vehicle_model')
    list_filter = ('vehicle_make', 'vehicle_model')
    search_fields = ('vehicle_license_plate', 'vin_number')


@admin.register(IdentificationEvidence)
class IdentificationEvidenceAdmin(admin.ModelAdmin):
    list_display = ('evidence_number', 'case', 'document_type', 'document_number', 'issued_by')
    list_filter = ('document_type', 'issued_by')
    search_fields = ('document_number',)