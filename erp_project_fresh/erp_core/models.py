from django.db import models
from django.contrib.auth.models import AbstractUser

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    company = models.ForeignKey(
        Company, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users'
    )
    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('employee', 'Employee'),
            ('accountant', 'Accountant'),
            ('inventory', 'Inventory Manager')
        ],
        default='admin'
    )


class Employee(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    name = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    office_email = models.EmailField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=100)

    employee_login_id = models.CharField(max_length=20, null=True, blank=True, db_index=True)
    temporary_password = models.CharField(max_length=255, null=True, blank=True)
    password_changed = models.BooleanField(default=False)

    salary = models.DecimalField(max_digits=12, decimal_places=2)
    attendance = models.IntegerField(default=100)
    performance_tag = models.CharField(max_length=20, default='none') # good, nice, excellent, warning
    warning_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        
        if not self.employee_id:
            # Pre-calculate the next sequential ID without saving first
            from django.db.models import Max
            max_id = Employee.objects.aggregate(Max('id'))['id__max'] or 0
            self.employee_id = f"ERP-{1001 + max_id}"
        
        if not self.office_email:
            # Generate email like first.last@clouderp.com
            clean_name = self.name.lower().replace(" ", ".")
            # Ensure unique email if name exists
            base_email = f"{clean_name}@clouderp.com"
            if Employee.objects.filter(office_email=base_email).exists():
                self.office_email = f"{clean_name}.{self.employee_id.lower()}@clouderp.com"
            else:
                self.office_email = base_email
            
        super().save(*args, **kwargs)


    def __str__(self):

        return self.name

    class Meta:
        unique_together = [['company', 'employee_login_id']]

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    risk_score = models.IntegerField(default=0)
    is_fraud = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Only calculate risk if not already set (or if it's a new transaction)
        if not self.risk_score:
            from .services import calculate_transaction_risk
            # Temporarily set to 0 to avoid recursion if services uses .save()
            self.risk_score, self.is_fraud = calculate_transaction_risk(self)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type} - {self.amount}"

class Inventory(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='inventory')
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    quantity = models.IntegerField()
    status = models.CharField(max_length=20, default='in_stock') # in_stock, low_stock, out_of_stock

    def __str__(self):
        return self.product_name

class Task(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class AuditLog(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255) # e.g., "Created Task", "Deleted Employee"
    resource_type = models.CharField(max_length=100) # e.g., "Task", "Transaction"
    resource_id = models.IntegerField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True) # Store what changed
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action} at {self.timestamp}"
