from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.db import models

from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    EmployeeSerializer, EmployeeCredentialsSerializer, EmployeeLoginSerializer,
    TransactionSerializer, InventorySerializer
)
from .models import Employee, Transaction, Inventory, CredentialAccessLog
from .permissions import IsCompanyMember, IsSameCompany
from rest_framework import viewsets


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Creates a new user and associated company (or joins existing).
    Returns an auth token on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Registration successful.',
                'token': token.key,
                'user': UserProfileSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates user credentials and returns an auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Login successful.',
                'token': token.key,
                'user': UserProfileSerializer(user).data,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Deletes the user's auth token, invalidating the session.
    Requires: Authorization: Token <key>
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Token.DoesNotExist:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET  /api/auth/me/   — Returns the authenticated user's profile + company info.
    PUT  /api/auth/me/   — Updates first_name, last_name, email.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Allows an authenticated user to change their password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not user.check_password(old_password):
            return Response(
                {'old_password': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(new_password) < 8:
            return Response(
                {'new_password': 'Password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_password != confirm_password:
            return Response(
                {'confirm_password': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        # Rotate token after password change for security
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)

        return Response({
            'message': 'Password changed successfully.',
            'token': new_token.key,   # frontend must store the new token
        }, status=status.HTTP_200_OK)


class EmployeeLoginView(APIView):
    """
    POST /api/auth/employee-login/
    Authenticates employee using employee_login_id and temporary password.
    Returns employee profile and auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployeeLoginSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.validated_data['employee']
            token, _ = Token.objects.get_or_create(user=employee.user)
            return Response({
                'message': 'Employee login successful.',
                'token': token.key,
                'role': 'employee',
                'user': UserProfileSerializer(employee.user).data,
                'employee': {
                    'employee_id': employee.id,
                    'employee_login_id': employee.employee_login_id,
                    'name': employee.name,
                    'company_id': employee.company.id,
                    'company_name': employee.company.name,
                    'password_changed': employee.password_changed,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class EmployeeChangePasswordView(APIView):
    """
    POST /api/auth/employee-change-password/
    Allows an employee to change their temporary password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee_login_id = request.data.get('employee_login_id', '')
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        try:
            employee = Employee.objects.get(employee_login_id=employee_login_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not employee.user or employee.user != request.user:
            return Response(
                {'error': 'You do not have permission to change this password.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not employee.user.check_password(old_password):
            return Response(
                {'old_password': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(new_password) < 8:
            return Response(
                {'new_password': 'Password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_password != confirm_password:
            return Response(
                {'confirm_password': 'Passwords do not match.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee.password_changed = True
        employee.save()
        employee.user.set_password(new_password)
        employee.user.save()

        Token.objects.filter(user=employee.user).delete()
        token = Token.objects.create(user=employee.user)

        return Response({
            'message': 'Password changed successfully.',
            'employee_id': employee.id,
            'password_changed': employee.password_changed,
            'token': token.key,
        }, status=status.HTTP_200_OK)


class CompanyScopedViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for resources scoped to a company.
    Automatically filters querysets and enforces company-level permissions.
    """
    permission_classes = [IsAuthenticated, IsCompanyMember, IsSameCompany]

    def get_queryset(self):
        # Enforce multi-tenant filtering at the database level
        return self.queryset.filter(company=self.request.user.company)


class EmployeeViewSet(CompanyScopedViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsCompanyMember])
    def credentials(self, request, pk=None):
        """
        GET /api/employees/{id}/credentials/
        Allows admin to view employee credentials.
        """
        employee = self.get_object()
        
        if hasattr(request.user, 'employee_profile') and request.user.employee_profile is not None:
            return Response(
                {'error': 'Only admins can view employee credentials.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        CredentialAccessLog.objects.create(
            company=employee.company,
            employee=employee,
            accessed_by=request.user,
            action='view_credentials'
        )

        serializer = EmployeeCredentialsSerializer(employee)
        return Response(serializer.data)


class TransactionViewSet(CompanyScopedViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer


class InventoryViewSet(CompanyScopedViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

class RecommendationsView(APIView):
    """
    Rule-based engine providing business recommendations.
    """
    permission_classes = [IsAuthenticated, IsCompanyMember]

    def get_recommendations(self, company):
        recommendations = []
        # Re-using logic for consolidated dashboard
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_fraud = Transaction.objects.filter(company=company, is_fraud=True, timestamp__gte=seven_days_ago).count()
        if recent_fraud > 0:
            recommendations.append({'type': 'danger', 'title': 'Security Alert', 'message': f'We detected {recent_fraud} suspicious transactions.', 'action': 'Review Transactions'})
        
        stats = Transaction.objects.filter(company=company).aggregate(
            rev=Sum('amount', filter=models.Q(type__in=['revenue', 'payment'])),
            exp=Sum('amount', filter=models.Q(type__in=['expense', 'refund']))
        )
        rev, exp = stats['rev'] or 0, stats['exp'] or 0
        if exp > rev and rev > 0:
            recommendations.append({'type': 'warning', 'title': 'Negative Cash Flow', 'message': 'Expenses exceeding revenue.', 'action': 'Analyze Expenses'})
        
        low_stock = Inventory.objects.filter(company=company, status__in=['low_stock', 'out_of_stock']).count()
        if low_stock > 0:
            recommendations.append({'type': 'warning', 'title': 'Inventory Shortage', 'message': f'{low_stock} items low on stock.', 'action': 'Go to Inventory'})
        
        if not recommendations:
            recommendations.append({'type': 'info', 'title': 'All Clear', 'message': 'Business metrics look stable.', 'action': 'View Reports'})
        return recommendations

    def get(self, request):
        return Response(self.get_recommendations(request.user.company))


class DashboardSummaryView(APIView):
    """
    Aggregated metrics for the dashboard home.
    """
    permission_classes = [IsAuthenticated, IsCompanyMember]

    def get(self, request):
        company = request.user.company
        
        # 1. Totals
        stats = Transaction.objects.filter(company=company).aggregate(
            total_revenue=Sum('amount', filter=models.Q(type__in=['revenue', 'payment'])),
            total_expenses=Sum('amount', filter=models.Q(type__in=['expense', 'refund']))
        )
        
        # 2. Alerts
        fraud_alerts = Transaction.objects.filter(company=company, is_fraud=True).count()
        low_stock = Inventory.objects.filter(company=company, status__in=['low_stock', 'out_of_stock']).count()
        
        # 3. Monthly Trends (Dummy data for charts if no historical DB data yet)
        # In a real app, you'd aggregate by month here.
        chart_data = [
            {'name': 'Jan', 'sales': 4000, 'expense': 2400},
            {'name': 'Feb', 'sales': 3000, 'expense': 1398},
            {'name': 'Mar', 'sales': 5000, 'expense': 3800},
            {'name': 'Apr', 'sales': 4500, 'expense': 3908},
            {'name': 'May', 'sales': 6000, 'expense': 4800},
            {'name': 'Jun', 'sales': 7000, 'expense': 3800},
        ]

        # 4. Recommendations
        rec_engine = RecommendationsView()
        recommendations = rec_engine.get_recommendations(company)

        return Response({
            'metrics': {
                'total_revenue': float(stats['total_revenue'] or 0),
                'total_expenses': float(stats['total_expenses'] or 0),
                'fraud_alerts': fraud_alerts,
                'low_stock': low_stock,
            },
            'chart_data': chart_data,
            'recommendations': recommendations
        })
