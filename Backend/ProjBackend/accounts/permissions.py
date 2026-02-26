from rest_framework import permissions
from accounts.models import Role


class IsTrainee(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == Role.TRAINEE


class IsOfficerOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            Role.POLICE_OFFICER, Role.PATROL_OFFICER,
            Role.DETECTIVE, Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF
        ]


class IsDetectiveOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            Role.DETECTIVE, Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF
        ]


class IsSergeantOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF]


class IsCaptainOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [Role.CAPTAIN, Role.POLICE_CHIEF]


class IsPoliceChief(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == Role.POLICE_CHIEF


class CanHandleCrimeLevel(permissions.BasePermission):
    def has_permission(self, request, view):
        # اجازه ورود اولیه به همه کاربران لاگین شده (پلیس)
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # اگر کاربر پلیس است، اجازه بده همه فایل‌ها را ببیند
        if request.user.role in [
            Role.POLICE_OFFICER, Role.PATROL_OFFICER, Role.DETECTIVE,
            Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF
        ]:
            return True

        # برای سایرین (مثل Citizen) چک کن
        if hasattr(obj, 'crime_level'):
            return request.user.can_handle_crime_level(obj.crime_level)
        return False