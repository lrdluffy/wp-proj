from django.contrib import admin
from .models import Reward, Payment


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'reward_type', 'amount', 'status', 'case', 'approved_by', 'created_at')
    list_filter = ('reward_type', 'status', 'created_at', 'approved_by')
    search_fields = ('recipient__username', 'description', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_number', 'payment_type', 'amount', 'status', 'payer_name', 'completed_at', 'created_at')
    list_filter = ('payment_type', 'status', 'payment_method', 'created_at')
    search_fields = ('payment_number', 'payer_name', 'payer_email', 'transaction_id', 'case__case_number')
    readonly_fields = ('created_at', 'updated_at', 'initiated_at')
    date_hierarchy = 'created_at'