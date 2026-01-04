from django.db import models


class Medicine(models.Model):
    name=models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    description=models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Customer(models.Model):
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.customer_name

class Invoice(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE)
    date=models.DateField(auto_now_add=True)
    total_amount=models.DecimalField(max_digits=10,decimal_places=2)
    
    def __str__(self):
        return f"Invoice {self.id}-{self.customer.customer_name}"

class InvoiceItem(models.Model):
    invoice=models.ForeignKey(Invoice,on_delete=models.CASCADE,related_name='items')
    medicine=models.ForeignKey(Medicine,on_delete=models.CASCADE,related_name='invoice_items')
    quantity=models.PositiveIntegerField(default=1)
    price=models.DecimalField(max_digits=10,decimal_places=2)

    def __str__(self):
        return f"{self.medicine.name} x {self.quantity}"