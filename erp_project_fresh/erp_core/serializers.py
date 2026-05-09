from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.core import signing
from .models import User, Company, Employee, Transaction, Inventory, Task


# ---------------------------------------------------------
# Auth Serializers
# ---------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['token'] = data.pop('access')
        data['user'] = UserSerializer(self.user).data
        return data


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'company', 'role']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True)
    company_name = serializers.CharField(
        help_text="Name of the company. Created automatically if it doesn't exist."
    )
    role = serializers.CharField(required=False, default='admin')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        role = validated_data.pop('role', 'admin')
        company, _ = Company.objects.get_or_create(name=company_name)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            company=company,
            role=role
        )
        return user



# ---------------------------------------------------------
# Data Model Serializers
# ---------------------------------------------------------

class EmployeeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'user', 'employee_id', 'office_email', 'role', 
            'employee_login_id', 'password_changed',
            'salary', 'attendance', 'performance_tag', 'warning_count', 
            'company', 'company_name'
        ]

        read_only_fields = ['company', 'company_name', 'employee_id', 'office_email']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # Only admin can see the login id (and never return password here)
        if not request or not request.user.is_authenticated or request.user.role != 'admin':
            data.pop('employee_login_id', None)
            data.pop('password_changed', None)

        return data

    def validate_salary(self, value):
        if value <= 0:
            raise serializers.ValidationError("Salary must be a positive number.")
        return value

    def validate_attendance(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Attendance must be between 0 and 100.")
        return value

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Prevent changing company on update
        validated_data.pop('company', None)
        return super().update(instance, validated_data)


class EmployeeCredentialsSerializer(serializers.ModelSerializer):
    temporary_password = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'name', 'employee_login_id', 'temporary_password', 'password_changed', 'created_at']

    def get_temporary_password(self, obj):
        # Stored as a signed string so we can safely show it to admin when needed.
        from .services import _unsign_password

        if not obj.temporary_password:
            return None
        try:
            return _unsign_password(obj.temporary_password)
        except signing.BadSignature:
            return None


class EmployeeLoginSerializer(serializers.Serializer):
    employee_login_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        employee_login_id = attrs.get('employee_login_id')
        password = attrs.get('password')

        user = authenticate(username=employee_login_id, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials. Please try again.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        if getattr(user, 'role', None) != 'employee':
            raise serializers.ValidationError('Invalid employee account.')

        attrs['user'] = user
        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'risk_score', 'is_fraud', 'timestamp', 'company', 'company_name']
        read_only_fields = ['company', 'company_name', 'timestamp', 'risk_score', 'is_fraud']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('company', None)
        return super().update(instance, validated_data)


class InventorySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'product_name', 'sku', 'quantity', 'unit_price', 'status', 'company', 'company_name']
        read_only_fields = ['company', 'company_name']

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('company', None)
        return super().update(instance, validated_data)

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_name',
            'assigned_by', 'assigned_by_name', 'due_date', 'status', 'created_at'
        ]
        read_only_fields = ['assigned_by', 'created_at']

    def create(self, validated_data):
        validated_data['assigned_by'] = self.context['request'].user
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)

