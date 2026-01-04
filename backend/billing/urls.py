from rest_framework import routers
from .views import *

router=routers.DefaultRouter()
router.register(r'medicines',MedicineViewSet)
router.register(r'customers',CustomerViewSet)
router.register(r'invoices',InvoiceViewSet)
# router.register(r'invoice-items',InvoiceItemViewSet)
urlpatterns=router.urls