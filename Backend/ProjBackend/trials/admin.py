from django.contrib import admin
from .models import Trial


@admin.register(Trial)
class TrialAdmin(admin.ModelAdmin):
    list_display = ('trial_number', 'case', 'suspect', 'status', 'scheduled_date', 'verdict', 'court_name')
    list_filter = ('status', 'verdict', 'scheduled_date', 'court_name')
    search_fields = ('trial_number', 'case__case_number', 'suspect__first_name', 'suspect__last_name', 'judge_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'scheduled_date'
    filter_horizontal = ('attended_by',)