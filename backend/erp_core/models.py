from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg, StdDev
from django.conf import settings


class Company(models.Model):
    """Represents a tenant company in the multi-company ERP system."""
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['name']

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    """
    Extends Django's built-in User model.
    Links each user to a specific Company (tenant).
    """
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.company})"


class Employee(models.Model):
    """Represents an employee belonging to a company."""

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('engineer', 'Engineer'),
        ('analyst', 'Analyst'),
        ('hr', 'HR Specialist'),
        ('sales', 'Sales'),
        ('finance', 'Finance'),
        ('employee', 'Employee'),
        ('other', 'Other'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='employees'
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile'
    )
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='employee')
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    attendance = models.FloatField(
        default=100.0,
        help_text="Attendance percentage (0–100)"
    )
    
    # Employee Login Credentials
    employee_login_id = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text="Auto-generated employee login ID (e.g., EMP1001)"
    )
    temporary_password = models.CharField(
        max_length=255,
        help_text="Auto-generated temporary password for first login"
    )
    password_changed = models.BooleanField(
        default=False,
        help_text="Track if employee has changed their temporary password"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = [['company', 'employee_login_id']]

    def __str__(self):
        return f"{self.name} — {self.get_role_display()} @ {self.company}"


class CredentialAccessLog(models.Model):
    """Audit log for sensitive employee credential access."""

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='credential_access_logs'
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='credential_access_logs'
    )
    accessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='credential_access_logs'
    )
    accessed_at = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=64, default='view_credentials')

    class Meta:
        ordering = ['-accessed_at']

    def __str__(self):
        return f"{self.accessed_by} viewed {self.employee.employee_login_id}"


class Transaction(models.Model):
    """Represents a financial transaction for a company."""

    TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('refund', 'Refund'),
        ('transfer', 'Transfer'),
        ('subscription', 'Subscription'),
        ('expense', 'Expense'),
        ('revenue', 'Revenue'),
    ]

    RISK_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    risk_score = models.PositiveSmallIntegerField(
        default=0,
        help_text="AI-computed risk score (0–100)"
    )
    risk_level = models.CharField(
        max_length=10,
        choices=RISK_CHOICES,
        default='low'
    )
    is_fraud = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']

    def save(self, *args, **kwargs):
        """
        Anomaly Detection using Z-Score:
        Calculates how many standard deviations the current amount is from the company's average.
        """
        # Only calculate risk if it's a new transaction and amount is provided
        if not self.pk and self.amount:
            stats = Transaction.objects.filter(company=self.company).aggregate(
                avg_amount=Avg('amount'),
                std_amount=StdDev('amount')
            )

            avg = stats['avg_amount']
            std = stats['std_amount']

            if avg and std and std > 0:
                z_score = abs(float(self.amount) - float(avg)) / float(std)
                # Normalize Z-score to a 0-100 risk score
                # Z > 3 is a strong outlier (approx 99.7% of data is within 3 std devs)
                self.risk_score = min(100, int(z_score * 33.3))
            else:
                # First transaction or no variance yet
                self.risk_score = 0

        # Auto-set risk_level and is_fraud based on computed risk_score
        if self.risk_score >= 80:
            self.risk_level = 'high'
            self.is_fraud = True
        elif self.risk_score >= 40:
            self.risk_level = 'medium'
            self.is_fraud = False
        else:
            self.risk_level = 'low'
            self.is_fraud = False
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_type_display()} — ${self.amount} [{self.risk_level}] @ {self.company}"


class Inventory(models.Model):
    """Represents a product in a company's inventory."""

    STATUS_CHOICES = [
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='inventory'
    )
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, blank=True, help_text="Stock Keeping Unit")
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(
        default=10,
        help_text="Alert when quantity falls below this value"
    )
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_stock',
        editable=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Inventory"
        ordering = ['product_name']

    def save(self, *args, **kwargs):
        """Auto-compute stock status based on quantity thresholds."""
        if self.quantity == 0:
            self.status = 'out_of_stock'
        elif self.quantity <= self.low_stock_threshold:
            self.status = 'low_stock'
        else:
            self.status = 'in_stock'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} (qty: {self.quantity}) @ {self.company}"
