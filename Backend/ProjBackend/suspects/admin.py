from django.contrib import admin
from .models import Suspect


@admin.register(Suspect)
class SuspectAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'case', 'status', 'national_id', 'identified_by', 'created_at')
    list_filter = ('status', 'created_at', 'identified_by', 'interrogated_by')
    search_fields = ('first_name', 'last_name', 'national_id', 'phone_number', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'