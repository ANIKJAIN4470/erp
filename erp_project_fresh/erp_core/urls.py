from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterAPIView, CurrentUserAPIView, CustomTokenObtainPairView,
    EmployeeLoginAPIView,
    EmployeeViewSet, TransactionViewSet, InventoryViewSet, TaskViewSet,
    DashboardAPIView, FraudulentTransactionViewSet, BenchmarkAPIView,
    RecommendationAPIView
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'fraud-transactions', FraudulentTransactionViewSet, basename='fraud-transaction')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'tasks', TaskViewSet, basename='task')


urlpatterns = [
    # Auth endpoints
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='api-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='api-refresh'),
    path('me/', CurrentUserAPIView.as_view(), name='api-me'),
    path('auth/employee-login/', EmployeeLoginAPIView.as_view(), name='api-employee-login'),
    path('employee-login/', EmployeeLoginAPIView.as_view(), name='api-employee-login-alias'),
    
    # AI/Dashboard endpoints
    path('ai/dashboard/', DashboardAPIView.as_view(), name='api-dashboard'),
    path('benchmark/', BenchmarkAPIView.as_view(), name='api-benchmark'),
    path('recommendations/', RecommendationAPIView.as_view(), name='api-recommendations'),
    
    # Data endpoints
    path('', include(router.urls)),
]
