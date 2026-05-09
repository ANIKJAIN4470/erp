import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_project.settings')
django.setup()

from erp_core.models import Employee

def fix_all_employees():
    print("Fixing all employees...")
    # First pass: clear all generated fields to avoid unique constraint issues
    for emp in Employee.objects.all():
        emp.employee_id = f"TEMP-{emp.id}"
        emp.save()
        
    # Second pass: generate proper IDs
    for emp in Employee.objects.all():
        emp.employee_id = None
        emp.office_email = None
        emp.save()
        print(f"Fixed: {emp.name} -> ID: {emp.employee_id}, Email: {emp.office_email}")

if __name__ == "__main__":
    fix_all_employees()
