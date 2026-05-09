from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Company, User, Employee, Transaction, Inventory

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'company', 'is_staff')
    list_filter = ('company', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'company__name')
    
    # Add 'company' to the fieldsets so it can be edited in the admin panel
    fieldsets = UserAdmin.fieldsets + (
        ('Company Information', {'fields': ('company',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Company Information', {'fields': ('company',)}),
    )

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'salary', 'company')
    list_filter = ('role', 'company')
    search_fields = ('name', 'company__name')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('amount', 'type', 'timestamp', 'company')
    list_filter = ('type', 'company')
    search_fields = ('company__name',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'quantity', 'company')
    list_filter = ('company',)
    search_fields = ('product_name', 'company__name')
