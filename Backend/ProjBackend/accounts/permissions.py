from rest_framework import permissions

from accounts.models import Role

class IsTraineeOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    

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
        return request.user.role in [
            Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF
        ]
        
        
class IsCaptainOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            Role.CAPTAIN, Role.POLICE_CHIEF
        ]
        
        
class IsPoliceChiefOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == Role.POLICE_CHIEF
    
    
class CanHandleCrimeLevel(permissions.BasePermissions):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if hasattr(obj, 'crime_level'):
            return request.user.can_handle_crime_level(obj.crime_level)
        return False
        