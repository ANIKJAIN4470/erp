from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Company, CustomUser


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
    Accepts company_name: creates company if it doesn't exist, or joins existing one.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'company_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return value

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        validated_data.pop('password2')
        password = validated_data.pop('password')

        # Get or create company by name
        company, _ = Company.objects.get_or_create(name=company_name)

        user = CustomUser(**validated_data)
        user.set_password(password)
        user.company = company
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Validates credentials and returns the authenticated user."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials. Please try again.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializes user profile info including their company."""
    company = CompanySerializer(read_only=True)
    role = serializers.SerializerMethodField()
    employee_login_id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'company', 'date_joined', 'role', 'employee_login_id']
        read_only_fields = ['date_joined', 'company']

    def get_role(self, obj):
        if hasattr(obj, 'employee_profile') and obj.employee_profile:
            return 'employee'
        return 'admin'

    def get_employee_login_id(self, obj):
        if hasattr(obj, 'employee_profile') and obj.employee_profile:
            return obj.employee_profile.employee_login_id
        return None


from .models import Employee, Transaction, Inventory
from .credential_utils import generate_employee_login_id, generate_temporary_password


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializes employee data.
    - Admin users see credentials
    - Employee users don't see credentials
    """
    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'role', 'salary', 'attendance', 
            'employee_login_id', 'temporary_password', 'password_changed',
            'created_at', 'updated_at', 'company'
        ]
        read_only_fields = ['company', 'employee_login_id', 'temporary_password', 'password_changed', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """
        Hide credentials from standard employee CRUD responses.
        Admins should use the dedicated credentials endpoint.
        """
        data = super().to_representation(instance)
        data.pop('employee_login_id', None)
        data.pop('temporary_password', None)
        return data

    def create(self, validated_data):
        """Auto-generate credentials when creating an employee."""
        request = self.context.get('request')
        company = request.user.company if request else None
        if company is None:
            raise serializers.ValidationError('Employee must belong to a valid company.')
        
        validated_data['company'] = company
        
        # Auto-generate credentials
        validated_data['employee_login_id'] = generate_employee_login_id(company.id)
        temporary_password = generate_temporary_password()
        validated_data['temporary_password'] = temporary_password

        employee_login_id = validated_data['employee_login_id']
        username = employee_login_id.lower()
        employee_user = CustomUser.objects.create(
            username=username,
            first_name=validated_data.get('name', ''),
            company=company,
            is_staff=False,
        )
        employee_user.set_password(temporary_password)
        employee_user.save()

        validated_data['user'] = employee_user
        return super().create(validated_data)


class EmployeeCredentialsSerializer(serializers.ModelSerializer):
    """
    Serializes only employee credentials (admin-only).
    Used for viewing and managing employee credentials.
    """
    class Meta:
        model = Employee
        fields = ['id', 'name', 'employee_login_id', 'temporary_password', 'password_changed', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmployeeLoginSerializer(serializers.Serializer):
    """
    Validates employee login credentials (employee_login_id + password).
    """
    employee_login_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            employee = Employee.objects.get(
                employee_login_id=attrs['employee_login_id']
            )
            if not employee.user or not employee.user.check_password(attrs['password']):
                raise serializers.ValidationError('Invalid credentials. Please try again.')
            attrs['employee'] = employee
        except Employee.DoesNotExist:
            raise serializers.ValidationError('Invalid employee login ID or password.')
        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['company', 'risk_level', 'is_fraud']

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ['company', 'status']

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)
