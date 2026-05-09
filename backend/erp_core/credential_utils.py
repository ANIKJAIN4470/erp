import random
import string


def generate_employee_login_id(company_id):
    """
    Generates a unique Employee Login ID like EMP1001, EMP1002, etc.
    """
    from .models import Employee
    
    existing_ids = Employee.objects.filter(employee_login_id__startswith='EMP').values_list('employee_login_id', flat=True)
    max_num = 1000
    for emp_id in existing_ids:
        try:
            max_num = max(max_num, int(emp_id.replace('EMP', '')))
        except (ValueError, AttributeError):
            continue

    next_num = max_num + 1
    while True:
        candidate = f"EMP{next_num}"
        if not Employee.objects.filter(employee_login_id=candidate).exists():
            return candidate
        next_num += 1


def generate_temporary_password(length=10):
    """
    Generates a secure temporary password with:
    - Uppercase letters
    - Lowercase letters
    - Numbers
    - Special characters (@, !, $, #)
    
    Format: Temp@4821, Emp@2026, Welcome@123
    """
    # Define character pools
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special_chars = '@!$#'
    
    # Ensure at least one of each required type
    password_chars = [
        random.choice(uppercase),
        random.choice(lowercase),
        random.choice(digits),
        random.choice(special_chars),
    ]
    
    # Fill the rest randomly
    all_chars = uppercase + lowercase + digits + special_chars
    password_chars.extend(
        random.choice(all_chars) for _ in range(length - 4)
    )
    
    # Shuffle to avoid predictable patterns
    random.shuffle(password_chars)
    
    return ''.join(password_chars)
