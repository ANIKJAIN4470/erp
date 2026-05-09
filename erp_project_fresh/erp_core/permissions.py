from rest_framework import permissions

class IsCompanyMember(permissions.BasePermission):
    """
    Strict object-level permission to ensure data isolation.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Allow superusers or ensure company matches
        return request.user.is_superuser or obj.company == request.user.company

class RoleBasedPermission(permissions.BasePermission):
    """
    Base class for role-based permissions.
    """
    required_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.role in self.required_roles or request.user.is_superuser)
        )

class IsAdmin(RoleBasedPermission):
    required_roles = ['admin']

class IsAccountant(RoleBasedPermission):
    required_roles = ['admin', 'accountant']

class IsInventoryManager(RoleBasedPermission):
    required_roles = ['admin', 'inventory']

class IsEmployee(RoleBasedPermission):
    required_roles = ['admin', 'employee', 'accountant', 'inventory']

class CanManageTasks(permissions.BasePermission):
    """
    Specific permission for task management logic.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Admin can do everything, Employees can only view/update status
        if request.user.role == 'admin':
            return True
        if view.action in ['list', 'retrieve', 'partial_update']:
            return True
        return False
