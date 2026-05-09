from django.db import models


class CompanyScopedManager(models.Manager):
    """
    Custom manager that filters any queryset to the user's company.
    Use this as a mixin in views via `get_queryset()`.
    """
    def for_company(self, company):
        return self.get_queryset().filter(company=company)
