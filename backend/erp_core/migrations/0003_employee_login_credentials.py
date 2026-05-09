# Generated migration for employee login credentials

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('erp_core', '0002_rename_is_flagged_transaction_is_fraud'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='employee_login_id',
            field=models.CharField(
                db_index=True,
                default='',
                help_text='Auto-generated employee login ID (e.g., EMP1001)',
                max_length=20,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='employee',
            name='temporary_password',
            field=models.CharField(
                default='',
                help_text='Auto-generated temporary password for first login',
                max_length=255,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='employee',
            name='password_changed',
            field=models.BooleanField(
                default=False,
                help_text='Track if employee has changed their temporary password',
            ),
        ),
        migrations.AlterField(
            model_name='employee',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Admin'),
                    ('manager', 'Manager'),
                    ('engineer', 'Engineer'),
                    ('analyst', 'Analyst'),
                    ('hr', 'HR Specialist'),
                    ('sales', 'Sales'),
                    ('finance', 'Finance'),
                    ('employee', 'Employee'),
                    ('other', 'Other'),
                ],
                default='employee',
                max_length=50,
            ),
        ),
        migrations.AlterUniqueTogether(
            name='employee',
            unique_together={('company', 'employee_login_id')},
        ),
        migrations.AddIndex(
            model_name='employee',
            index=models.Index(
                fields=['employee_login_id'],
                name='erp_core_em_employ_idx',
            ),
        ),
    ]
