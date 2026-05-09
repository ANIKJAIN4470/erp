from rest_framework.permissions import BasePermission


class IsCompanyMember(BasePermission):
    """
    Grants access only if the requesting user belongs to a company.
    Used as a base guard on all ERP resource endpoints.
    """
    message = 'You must be associated with a company to access this resource.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.company is not None
        )


class IsSameCompany(BasePermission):
    """
    Object-level permission: grants access only if the object's company
    matches the requesting user's company. Prevents cross-tenant data leaks.
    """
    message = 'You do not have permission to access data from another company.'

    def has_object_permission(self, request, view, obj):
        # Supports models with a direct `company` FK or nested via `user.company`
        obj_company = getattr(obj, 'company', None)
        return obj_company == request.user.company
