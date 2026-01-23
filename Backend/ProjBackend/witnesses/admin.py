from django.contrib import admin
from .models import WitnessStatement


@admin.register(WitnessStatement)
class WitnessStatementAdmin(admin.ModelAdmin):
    list_display = ('witness_name', 'case', 'statement_date', 'recorded_by', 'is_confidential', 'created_at')
    list_filter = ('statement_date', 'is_confidential', 'follow_up_required', 'created_at', 'recorded_by')
    search_fields = ('witness_name', 'witness_phone', 'witness_email', 'statement', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'statement_date'