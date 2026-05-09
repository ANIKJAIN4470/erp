from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('erp_core', '0007_remove_employee_user_id_employee_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='employee_login_id',
            field=models.CharField(blank=True, db_index=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='employee',
            name='temporary_password',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='employee',
            name='password_changed',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterUniqueTogether(
            name='employee',
            unique_together={('company', 'employee_login_id')},
        ),
    ]
