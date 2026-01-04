from django.contrib import admin
from .models import Medicine, Customer, Invoice, InvoiceItem
# Register your models here.
admin.site.register(Medicine)
admin.site.register(Customer)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
