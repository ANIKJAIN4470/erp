from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_employee_users(apps, schema_editor):
    Employee = apps.get_model('erp_core', 'Employee')
    CustomUser = apps.get_model('erp_core', 'CustomUser')

    for employee in Employee.objects.filter(user__isnull=True):
        base_username = (employee.employee_login_id or f"emp{employee.id}").lower()
        username = base_username
        suffix = 1
        while CustomUser.objects.filter(username=username).exists():
            suffix += 1
            username = f"{base_username}{suffix}"

        user = CustomUser.objects.create(
            username=username,
            first_name=employee.name or '',
            company=employee.company,
            is_staff=False,
            password=make_password(employee.temporary_password),
        )

        employee.user = user
        employee.save(update_fields=['user'])


def noop(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ('erp_core', '0004_employee_user_and_credential_access_log'),
    ]

    operations = [
        migrations.RunPython(create_employee_users, reverse_code=noop),
    ]
