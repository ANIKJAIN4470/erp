import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_project.settings')
django.setup()

from erp_core.models import Employee, User, Company

def create_credentials():
    company = Company.objects.first()
    if not company:
        company = Company.objects.create(name="TechCorp")

    employees_data = [
        ("Alice Johnson", "alice_j", "Lead Engineer"),
        ("Anik Jain", "anik_j", "Web Developer"),
        ("Bob Smith", "bob_s", "Product Manager"),
        ("Charlie Davis", "charlie_d", "UI/UX Designer"),
        ("Diana Prince", "diana_p", "Data Scientist"),
        ("Ethan Hunt", "ethan_h", "Security Analyst"),
        ("Frank Castle", "frank_c", "Lead Security"),
        ("Grace Hopper", "grace_h", "Senior Scientist"),
    ]

    for name, uid, role in employees_data:
        # Create User account if not exists
        user, created = User.objects.get_or_create(
            username=uid,
            defaults={
                'company': company,
                'role': 'employee',
                'email': f"{uid}@example.com"
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created User: {uid}")

        # Update or Create Employee record
        emp, emp_created = Employee.objects.get_or_create(
            name=name,
            defaults={
                'company': company,
                'user_id': uid,
                'role': role,
                'salary': 50000 + (len(name) * 1000), # random-ish
                'attendance': 95
            }
        )
        if not emp_created:
            emp.user_id = uid
            emp.save()
            print(f"Updated Employee: {name}")
        else:
            print(f"Created Employee: {name}")

if __name__ == "__main__":
    create_credentials()
