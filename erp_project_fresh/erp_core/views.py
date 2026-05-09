from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Employee, Transaction, Inventory, Task
from .serializers import (
    RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    EmployeeSerializer, EmployeeCredentialsSerializer, EmployeeLoginSerializer,
    TransactionSerializer, InventorySerializer, TaskSerializer
)



from .permissions import IsCompanyMember, IsAdmin, IsAccountant, IsInventoryManager, IsEmployee
from .pagination import ERPPagination

# ---------------------------------------------------------
# Authentication Views
# ---------------------------------------------------------

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "token": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmployeeLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployeeLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        employee = Employee.objects.filter(user=user).select_related('company').first()

        return Response({
            'message': 'Employee login successful.',
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'employee': {
                'id': employee.id if employee else None,
                'name': employee.name if employee else user.username,
                'role': 'employee',
                'employee_login_id': user.username,
                'password_changed': employee.password_changed if employee else True,
                'company_id': employee.company.id if employee else None,
                'company_name': employee.company.name if employee else None,
            }
        }, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Multi-Tenant Base ViewSet
# ---------------------------------------------------------

class CompanyScopedViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet: automatically scopes all querysets to the logged-in user's company.
    """
    permission_classes = [IsAuthenticated, IsCompanyMember]
    pagination_class = ERPPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser and not user.company:
            return self.queryset.all()
        return self.queryset.filter(company=user.company)

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if not user.is_superuser and hasattr(obj, 'company') and obj.company != user.company:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have access to this resource.")
        return obj

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Deleted successfully."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# Data ViewSets
# ---------------------------------------------------------

class EmployeeViewSet(CompanyScopedViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdmin]
    search_fields = ['name', 'role']
    ordering_fields = ['name', 'salary', 'attendance']
    ordering = ['name']
    def create(self, request, *args, **kwargs):
        from .services import EmployeeService
        try:
            employee = EmployeeService.onboard_employee(request.user, request.data)
            return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='credentials')
    def credentials(self, request, pk=None):
        from .models import AuditLog

        employee = self.get_object()

        AuditLog.objects.create(
            company=request.user.company,
            user=request.user,
            action='EMPLOYEE_CREDENTIALS_VIEWED',
            resource_type='Employee',
            resource_id=employee.id,
            payload={'employee_login_id': employee.employee_login_id}
        )

        return Response(EmployeeCredentialsSerializer(employee).data, status=status.HTTP_200_OK)


class TransactionViewSet(CompanyScopedViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAccountant | IsAdmin]
    search_fields = ['type']
    ordering_fields = ['amount', 'timestamp']
    ordering = ['-timestamp']


class InventoryViewSet(CompanyScopedViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsInventoryManager]
    search_fields = ['product_name']
    ordering_fields = ['product_name', 'quantity']
    ordering = ['product_name']

class TaskViewSet(CompanyScopedViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsCompanyMember]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Admins see all tasks in company, others only their own
        if user.role == 'admin':
            return qs
        return qs.filter(assigned_to=user)

    def perform_create(self, serializer):
        # Only admin can create tasks
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only administrators can assign tasks.")
        serializer.save()



class FraudulentTransactionViewSet(CompanyScopedViewSet):
    queryset = Transaction.objects.filter(is_fraud=True)
    serializer_class = TransactionSerializer
    permission_classes = [IsAccountant]
    http_method_names = ['get']

    def get_queryset(self):
        return super().get_queryset().filter(is_fraud=True)


# ---------------------------------------------------------
# AI Insights / Dashboard
# ---------------------------------------------------------

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyMember]

    def get(self, request):
        from .services import DashboardService
        data = DashboardService.get_dashboard_data(request.user)
        # Manually serialize the alerts list since it's a queryset
        data["fraud_alerts_list"] = TransactionSerializer(data["fraud_alerts_list"], many=True).data
        return Response(data, status=status.HTTP_200_OK)


class BenchmarkAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyMember, IsAccountant]

    def get(self, request):
        from .services import get_company_benchmarks
        data = get_company_benchmarks(request.user.company)
        if data:
            return Response(data, status=status.HTTP_200_OK)
        return Response({"error": "No data available for benchmarking."}, status=status.HTTP_404_NOT_FOUND)


class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCompanyMember]

    def get(self, request):
        from .services import generate_recommendations
        recs = generate_recommendations(request.user.company)
        return Response(recs, status=status.HTTP_200_OK)
