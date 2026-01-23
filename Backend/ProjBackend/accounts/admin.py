from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'badge_number', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'badge_number')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Police Information', {
            'fields': ('role', 'badge_number', 'phone_number')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Police Information', {
            'fields': ('role', 'badge_number', 'phone_number')
        })
    )