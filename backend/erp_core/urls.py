from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, MeView, ChangePasswordView,
    EmployeeLoginView, EmployeeChangePasswordView,
    EmployeeViewSet, TransactionViewSet, InventoryViewSet, RecommendationsView,
    DashboardSummaryView
)

# Use DRF router for viewsets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'inventory', InventoryViewSet, basename='inventory')

urlpatterns = [
    # Auth endpoints
    path('auth/register/',                 RegisterView.as_view(),                 name='auth-register'),
    path('auth/login/',                    LoginView.as_view(),                    name='auth-login'),
    path('auth/employee-login/',           EmployeeLoginView.as_view(),            name='auth-employee-login'),
    path('auth/logout/',                   LogoutView.as_view(),                   name='auth-logout'),
    path('auth/me/',                       MeView.as_view(),                       name='auth-me'),
    path('auth/change-password/',          ChangePasswordView.as_view(),           name='auth-change-password'),
    path('auth/employee-change-password/', EmployeeChangePasswordView.as_view(),   name='auth-employee-change-password'),
    path('ai/recommendations/',            RecommendationsView.as_view(),          name='ai-recommendations'),
    path('ai/dashboard/',                  DashboardSummaryView.as_view(),         name='ai-dashboard'),

    # ViewSet endpoints
    path('', include(router.urls)),
]
