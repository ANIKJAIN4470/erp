import logging
import json
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog

logger = logging.getLogger(__name__)

class EnterpriseAuditMiddleware(MiddlewareMixin):
    """
    Enterprise-grade middleware to track all data mutations (POST, PUT, PATCH, DELETE)
    and log them to the AuditLog table for compliance.
    """
    def process_response(self, request, response):
        # Only log mutations for authenticated users that were successful
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if 200 <= response.status_code < 300:
                try:
                    # Extract info from request
                    company = request.user.company
                    user = request.user
                    action = f"{request.method} {request.path}"
                    
                    # Try to parse the request body for payload
                    payload = {}
                    if request.body:
                        try:
                            payload = json.loads(request.body)
                        except:
                            payload = {"body": "Non-JSON payload"}

                    # Create Audit Log
                    AuditLog.objects.create(
                        company=company,
                        user=user,
                        action=action,
                        resource_type=request.path.split('/')[2] if len(request.path.split('/')) > 2 else "Unknown",
                        payload=payload,
                        ip_address=self.get_client_ip(request)
                    )
                except Exception as e:
                    logger.error(f"Audit Logging Middleware Error: {e}")
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
