from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('erp_core', '0003_employee_login_credentials'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='user',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='employee_profile',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name='CredentialAccessLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accessed_at', models.DateTimeField(auto_now_add=True)),
                ('action', models.CharField(default='view_credentials', max_length=64)),
                ('accessed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='credential_access_logs', to=settings.AUTH_USER_MODEL)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='credential_access_logs', to='erp_core.company')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='credential_access_logs', to='erp_core.employee')),
            ],
            options={
                'ordering': ['-accessed_at'],
            },
        ),
    ]
