from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('complaint_number', 'subject', 'complainant_name', 'status', 'incident_date', 'received_by', 'created_at')
    list_filter = ('status', 'incident_date', 'created_at', 'received_by')
    search_fields = ('complaint_number', 'subject', 'complainant_name', 'complainant_phone', 'description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'