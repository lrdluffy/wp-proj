from django.contrib import admin
from core.models import Case, CrimeScene


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'title', 'crime_level', 'status', 'assigned_to', 'created_at')
    list_filter = ('status', 'crime_level', 'created_at', 'assigned_to')
    search_fields = ('case_number', 'title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'


@admin.register(CrimeScene)
class CrimeSceneAdmin(admin.ModelAdmin):
    list_display = ('location', 'case', 'occurred_at', 'discovered_by', 'processed_by')
    list_filter = ('occurred_at', 'discovered_at', 'created_at')
    search_fields = ('location', 'description', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at')