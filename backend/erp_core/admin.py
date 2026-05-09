from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.db.models import Count, Sum

from .models import Company, CustomUser, Employee, Transaction, Inventory, CredentialAccessLog


# ─────────────────────────────────────────────
# Inline Admins (nested models inside Company)
# ─────────────────────────────────────────────

class EmployeeInline(admin.TabularInline):
    """Show employees directly inside a Company record."""
    model = Employee
    extra = 0
    fields = ('name', 'role', 'salary', 'attendance')
    show_change_link = True


class InventoryInline(admin.TabularInline):
    """Show inventory items directly inside a Company record."""
    model = Inventory
    extra = 0
    fields = ('product_name', 'sku', 'quantity', 'status')
    readonly_fields = ('status',)
    show_change_link = True


# ─────────────────────────────────────────────
# Company Admin
# ─────────────────────────────────────────────

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'employee_count', 'total_revenue', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)
    readonly_fields = ('created_at',)
    inlines = [EmployeeInline, InventoryInline]

    fieldsets = (
        (None, {
            'fields': ('name',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _employee_count=Count('employees', distinct=True),
            _total_revenue=Sum('transactions__amount'),
        )

    @admin.display(description='Employees', ordering='_employee_count')
    def employee_count(self, obj):
        count = getattr(obj, '_employee_count', 0) or 0
        return format_html('<b>{}</b>', count)

    @admin.display(description='Total Revenue', ordering='_total_revenue')
    def total_revenue(self, obj):
        total = getattr(obj, '_total_revenue', 0) or 0
        return format_html('<span style="color: #16a34a; font-weight: bold;">${:,.2f}</span>', total)


# ─────────────────────────────────────────────
# Custom User Admin
# ─────────────────────────────────────────────

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'get_full_name', 'company', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('company', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    list_select_related = ('company',)

    # Add 'company' field to the user creation/edit forms
    fieldsets = UserAdmin.fieldsets + (
        ('Company Association', {
            'fields': ('company',),
            'description': 'Link this user to a company for multi-tenant access control.'
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Company Association', {
            'fields': ('company',),
        }),
    )


# ─────────────────────────────────────────────
# Employee Admin
# ─────────────────────────────────────────────

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'employee_login_id', 'role_badge', 'company', 'salary_display', 'attendance_bar', 'created_at')
    list_filter = ('role', 'company')
    search_fields = ('name', 'employee_login_id', 'company__name')
    ordering = ('company', 'name')
    list_select_related = ('company',)
    readonly_fields = ('created_at', 'updated_at', 'employee_login_id', 'temporary_password', 'password_changed', 'user')

    fieldsets = (
        ('Personal Info', {
            'fields': ('name', 'role', 'company'),
        }),
        ('Compensation & Attendance', {
            'fields': ('salary', 'attendance'),
        }),
        ('Login Credentials', {
            'fields': ('employee_login_id', 'temporary_password', 'password_changed', 'user'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # Custom admin actions
    actions = ['mark_full_attendance']

    @admin.action(description='Set attendance to 100% for selected employees')
    def mark_full_attendance(self, request, queryset):
        updated = queryset.update(attendance=100.0)
        self.message_user(request, f'{updated} employee(s) updated to 100% attendance.')

    @admin.display(description='Role', ordering='role')
    def role_badge(self, obj):
        colors = {
            'admin': '#7c3aed', 'manager': '#2563eb', 'engineer': '#0891b2',
            'analyst': '#059669', 'hr': '#d97706', 'sales': '#dc2626',
            'finance': '#9d174d', 'other': '#6b7280',
        }
        color = colors.get(obj.role, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:12px;font-size:0.8em;font-weight:600;">{}</span>',
            color, obj.get_role_display()
        )

    @admin.display(description='Salary', ordering='salary')
    def salary_display(self, obj):
        return format_html('<span style="font-weight:600;">${:,.2f}</span>', obj.salary)

    @admin.display(description='Attendance %', ordering='attendance')
    def attendance_bar(self, obj):
        color = '#16a34a' if obj.attendance >= 90 else ('#f59e0b' if obj.attendance >= 70 else '#dc2626')
        return format_html(
            '<div style="background:#e5e7eb;border-radius:4px;width:100px;height:10px;">'
            '<div style="background:{};width:{}%;height:100%;border-radius:4px;"></div></div>'
            ' <small>{:.1f}%</small>',
            color, min(obj.attendance, 100), obj.attendance
        )


# ─────────────────────────────────────────────
# Transaction Admin
# ─────────────────────────────────────────────

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'type_badge', 'amount_display', 'risk_indicator', 'is_fraud', 'company', 'timestamp')
    list_filter = ('type', 'risk_level', 'is_fraud', 'company')
    search_fields = ('description', 'company__name')
    ordering = ('-timestamp',)
    list_select_related = ('company',)
    readonly_fields = ('risk_level', 'is_fraud', 'timestamp')
    date_hierarchy = 'timestamp'

    fieldsets = (
        ('Transaction Details', {
            'fields': ('company', 'type', 'amount', 'description'),
        }),
        ('Risk Analysis', {
            'fields': ('risk_score', 'risk_level', 'is_fraud'),
            'description': 'Risk level and fraud status are automatically computed from the risk score.'
        }),
        ('Timestamps', {
            'fields': ('timestamp',),
            'classes': ('collapse',),
        }),
    )

    actions = ['flag_selected', 'unflag_selected']

    @admin.action(description='Flag selected transactions as suspicious')
    def flag_selected(self, request, queryset):
        updated = queryset.update(is_fraud=True, risk_level='high')
        self.message_user(request, f'{updated} transaction(s) flagged.')

    @admin.action(description='Unflag selected transactions')
    def unflag_selected(self, request, queryset):
        updated = queryset.update(is_fraud=False)
        self.message_user(request, f'{updated} transaction(s) unflagged.')

    @admin.display(description='Type', ordering='type')
    def type_badge(self, obj):
        colors = {
            'payment': '#2563eb', 'refund': '#d97706', 'transfer': '#7c3aed',
            'subscription': '#0891b2', 'expense': '#dc2626', 'revenue': '#16a34a',
        }
        color = colors.get(obj.type, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:12px;font-size:0.8em;font-weight:600;">{}</span>',
            color, obj.get_type_display()
        )

    @admin.display(description='Amount', ordering='amount')
    def amount_display(self, obj):
        return format_html('<span style="font-weight:600;">${:,.2f}</span>', obj.amount)

    @admin.display(description='Risk', ordering='risk_score')
    def risk_indicator(self, obj):
        colors = {'low': '#16a34a', 'medium': '#f59e0b', 'high': '#dc2626'}
        color = colors.get(obj.risk_level, '#6b7280')
        return format_html(
            '<span style="color:{};font-weight:700;">{} ({})</span>',
            color, obj.risk_level.upper(), obj.risk_score
        )


# ─────────────────────────────────────────────
# Inventory Admin
# ─────────────────────────────────────────────

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'company', 'quantity_display', 'status_badge', 'unit_price', 'updated_at')
    list_filter = ('status', 'company')
    search_fields = ('product_name', 'sku', 'company__name')
    ordering = ('company', 'product_name')
    list_select_related = ('company',)
    readonly_fields = ('status', 'created_at', 'updated_at')

    fieldsets = (
        ('Product Details', {
            'fields': ('company', 'product_name', 'sku', 'unit_price'),
        }),
        ('Stock Management', {
            'fields': ('quantity', 'low_stock_threshold', 'status'),
            'description': 'Status is automatically determined from quantity and threshold.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['restock_items']

    @admin.action(description='Restock selected items to 100 units')
    def restock_items(self, request, queryset):
        for item in queryset:
            item.quantity = 100
            item.save()  # triggers auto-status update
        self.message_user(request, f'{queryset.count()} item(s) restocked to 100 units.')

    @admin.display(description='Quantity', ordering='quantity')
    def quantity_display(self, obj):
        color = '#dc2626' if obj.quantity == 0 else ('#f59e0b' if obj.quantity <= obj.low_stock_threshold else '#16a34a')
        return format_html('<span style="color:{};font-weight:700;">{}</span>', color, obj.quantity)

    @admin.display(description='Status', ordering='status')
    def status_badge(self, obj):
        styles = {
            'in_stock':    ('background:#d1fae5;color:#065f46', 'In Stock'),
            'low_stock':   ('background:#fef3c7;color:#92400e', 'Low Stock'),
            'out_of_stock': ('background:#fee2e2;color:#991b1b', 'Out of Stock'),
        }
        style, label = styles.get(obj.status, ('', obj.status))
        return format_html(
            '<span style="{};padding:2px 10px;border-radius:12px;font-size:0.8em;font-weight:600;">{}</span>',
            style, label
        )


# ─────────────────────────────────────────────
# Admin Site Header Customisation
# ─────────────────────────────────────────────

admin.site.site_header = "CloudERP AI — Admin Panel"
admin.site.site_title = "CloudERP Admin"
admin.site.index_title = "Welcome to the CloudERP Administration Dashboard"


@admin.register(CredentialAccessLog)
class CredentialAccessLogAdmin(admin.ModelAdmin):
    list_display = ('employee', 'accessed_by', 'company', 'action', 'accessed_at')
    list_filter = ('action', 'company', 'accessed_at')
    search_fields = ('employee__name', 'employee__employee_login_id', 'accessed_by__username')
    readonly_fields = ('employee', 'accessed_by', 'company', 'action', 'accessed_at')
