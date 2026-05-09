import math
import random
import string

from django.conf import settings
from django.core import signing
from django.db import transaction
from django.db.models import Max
from django.db.models import Avg, StdDev
from .models import Transaction


def _sign_password(raw_password: str) -> str:
    return signing.dumps(raw_password, salt='employee-temp-password', key=settings.SECRET_KEY)


def _unsign_password(signed_password: str) -> str:
    return signing.loads(signed_password, salt='employee-temp-password', key=settings.SECRET_KEY)


def generate_temporary_password(length: int = 10) -> str:
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special_chars = '@!$#'

    password_chars = [
        random.choice(uppercase),
        random.choice(lowercase),
        random.choice(digits),
        random.choice(special_chars),
    ]

    all_chars = uppercase + lowercase + digits + special_chars
    password_chars.extend(random.choice(all_chars) for _ in range(max(0, length - 4)))
    random.shuffle(password_chars)
    return ''.join(password_chars)


def generate_employee_login_id(company_id: int) -> str:
    from .models import Employee

    with transaction.atomic():
        max_login_id = Employee.objects.filter(company_id=company_id, employee_login_id__startswith='EMP').aggregate(
            max_id=Max('employee_login_id')
        )['max_id']

        if not max_login_id:
            next_num = 1001
        else:
            try:
                next_num = int(str(max_login_id).replace('EMP', '')) + 1
            except ValueError:
                next_num = 1001

        candidate = f"EMP{next_num}"
        while Employee.objects.filter(company_id=company_id, employee_login_id=candidate).exists():
            next_num += 1
            candidate = f"EMP{next_num}"
        return candidate

def calculate_transaction_risk(transaction):
    """
    Combines statistical Z-score logic with hard business rules for fraud detection.
    """
    # 1. Hard Rule: Transactions over 50,000 are auto-flagged
    if transaction.amount >= 50000:
        return 100, True

    company = transaction.company
    
    # 2. Get historical data for this company
    history = Transaction.objects.filter(company=company).exclude(id=transaction.id)
    
    if history.count() < 5:
        # Not enough data to calculate meaningful Z-score
        return 0.0, False

    stats = history.aggregate(avg=Avg('amount'), std=StdDev('amount'))
    avg_amt = float(stats['avg'] or 0)
    std_amt = float(stats['std'] or 1) # Avoid division by zero
    
    if std_amt == 0: std_amt = 1 # Edge case: all historical amounts are identical
    
    # 3. Calculate Z-score (Number of standard deviations from mean)
    current_amt = float(transaction.amount)
    z_score = abs(current_amt - avg_amt) / std_amt
    
    # 4. Frequency check (Recent transactions in last hour)
    from django.utils import timezone
    from datetime import timedelta
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_count = history.filter(timestamp__gte=one_hour_ago).count()
    
    # 4. Normalize score to 0-100 range
    # A Z-score of 3 is usually considered a strong outlier (99.7% of data is within 3 std devs)
    # We'll map Z-score 3+ to 80+ risk
    risk_score = min(100, (z_score / 3.0) * 80)
    
    # Add penalty for high frequency (more than 10 tx per hour for this company)
    if recent_count > 10:
        risk_score += min(20, (recent_count - 10) * 2)
    
    is_fraud = risk_score >= 80
    
    return round(float(risk_score), 2), is_fraud


def get_company_benchmarks(target_company):
    """
    Compares the target company's performance against the system-wide average.
    """
    from .models import Company, Transaction
    from django.db.models import Sum

    all_companies = Company.objects.all()
    company_count = all_companies.count()
    
    if company_count == 0:
        return None

    # 1. Calculate System Averages
    all_income = Transaction.objects.filter(type='income').aggregate(s=Sum('amount'))['s'] or 0
    all_expense = Transaction.objects.filter(type='expense').aggregate(s=Sum('amount'))['s'] or 0
    
    avg_income = float(all_income) / company_count
    avg_expense = float(all_expense) / company_count
    avg_profit = avg_income - avg_expense

    # 2. Calculate Current Company Metrics
    my_income = float(Transaction.objects.filter(company=target_company, type='income').aggregate(s=Sum('amount'))['s'] or 0)
    my_expense = float(Transaction.objects.filter(company=target_company, type='expense').aggregate(s=Sum('amount'))['s'] or 0)
    my_profit = my_income - my_expense

    def get_diff_string(mine, avg):
        if avg == 0: return "+100%" if mine > 0 else "0%"
        diff = ((mine - avg) / avg) * 100
        return f"{'+' if diff >= 0 else ''}{round(diff)}%"

    # 3. Determine overall status
    if my_profit > avg_profit * 1.1:
        status = "Above Average"
    elif my_profit < avg_profit * 0.9:
        status = "Below Average"
    else:
        status = "Average"

    return {
        "sales_comparison": get_diff_string(my_income, avg_income),
        "expense_comparison": get_diff_string(my_expense, avg_expense),
        "profit_comparison": get_diff_string(my_profit, avg_profit),
        "status": status
    }


def generate_recommendations(company):
    """
    Generates actionable business insights based on company data, fraud status, 
    and benchmarking against system averages.
    """
    from .models import Transaction, Inventory
    from django.db.models import Sum
    from .services import get_company_benchmarks

    recs = []
    
    # 1. Financial Health Check
    income = float(Transaction.objects.filter(company=company, type='income').aggregate(s=Sum('amount'))['s'] or 0)
    expense = float(Transaction.objects.filter(company=company, type='expense').aggregate(s=Sum('amount'))['s'] or 0)

    if expense > income:
        recs.append("High expenses detected, consider reducing operational costs")

    # 2. Benchmarking Check
    benchmarks = get_company_benchmarks(company)
    if benchmarks:
        # Check if sales comparison is negative (e.g. "-100%")
        sales_diff = int(benchmarks['sales_comparison'].replace('%', ''))
        if sales_diff < 0:
            recs.append("Sales are below average, improve marketing strategy")

    # 3. Fraud Detection Check
    fraud_exists = Transaction.objects.filter(company=company, is_fraud=True).exists()
    if fraud_exists:
        recs.append("Fraudulent transactions detected, review financial activity")

    # 4. Inventory Check
    low_stock_items = Inventory.objects.filter(company=company, status='low_stock')
    if low_stock_items.exists():
        count = low_stock_items.count()
        recs.append(f"Low inventory alert for {count} products, suggest restocking soon")

    # Default if no specific issues
    if not recs:
        recs.append("Business performance is stable. Continue monitoring key metrics.")

    return recs



class EmployeeService:
    @staticmethod
    def onboard_employee(request_user, employee_data):
        """
        Handles the complex onboarding of a new employee including ID generation,
        email creation, and audit logging.
        """
        from .models import Employee, AuditLog, User
        from django.db import Transaction as DBTransaction
        from django.db.models import Max

        with DBTransaction.atomic():
            # 1. Generate sequential ERP ID
            max_id = Employee.objects.aggregate(Max('id'))['id__max'] or 0
            emp_id = f"ERP-{1001 + max_id}"
            
            # 2. Generate Office Email
            clean_name = employee_data['name'].lower().replace(" ", ".")
            base_email = f"{clean_name}@clouderp.com"
            if Employee.objects.filter(office_email=base_email).exists():
                office_email = f"{clean_name}.{emp_id.lower()}@clouderp.com"
            else:
                office_email = base_email

            # 3. Create Employee instance
            employee_login_id = generate_employee_login_id(request_user.company_id)
            raw_temp_password = generate_temporary_password()

            employee_user = User.objects.create_user(
                username=employee_login_id,
                password=raw_temp_password,
                company=request_user.company,
                role='employee'
            )

            employee = Employee.objects.create(
                company=request_user.company,
                name=employee_data['name'],
                role=employee_data['role'],
                salary=employee_data['salary'],
                employee_id=emp_id,
                user=employee_user,
                office_email=office_email,
                attendance=employee_data.get('attendance', 100),
                employee_login_id=employee_login_id,
                temporary_password=_sign_password(raw_temp_password),
                password_changed=False,
            )

            # 4. Audit Logging
            AuditLog.objects.create(
                company=request_user.company,
                user=request_user,
                action="EMPLOYEE_ONBOARDED",
                resource_type="Employee",
                resource_id=employee.id,
                payload={"name": employee.name, "id": emp_id, "employee_login_id": employee_login_id}
            )

            return employee

class DashboardService:
    @staticmethod
    def get_dashboard_data(user):
        company = user.company
        from django.db.models import Sum
        
        transactions = Transaction.objects.filter(company=company)
        fraudulent_txs = transactions.filter(is_fraud=True)
        
        total_revenue = transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        fraud_count = fraudulent_txs.count()
        
        benchmarks = get_company_benchmarks(user.company)
        recommendations = generate_recommendations(user.company)

        recent_txs = transactions.order_by('-timestamp')[:6]
        chart_data = []
        for tx in reversed(recent_txs):
            chart_data.append({
                "name": tx.timestamp.strftime('%b %d'),
                "sales": float(tx.amount) if tx.type == 'income' else 0,
                "expense": float(tx.amount) if tx.type == 'expense' else 0,
            })

        if not chart_data:
            chart_data = [{"name": "No Data", "sales": 0, "expense": 0}]

        return {
            "metrics": {
                "total_sales": float(total_revenue),
                "total_expenses": float(total_expenses),
                "profit": float(total_revenue - total_expenses),
                "fraud_alerts": fraud_count
            },
            "benchmarks": benchmarks,
            "recommendations": recommendations,
            "chart_data": chart_data,
            "fraud_alerts_list": fraudulent_txs[:5]
        }
