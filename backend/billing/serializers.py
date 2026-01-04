from rest_framework import serializers
from .models import Medicine, Customer, Invoice, InvoiceItem

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model=Medicine
        fields='__all__'
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model=Customer
        fields='__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    class Meta:
        model=InvoiceItem
        fields='__all__'
        extra_kwargs = {'invoice': {'read_only': True}}

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=False)
    customer_name = serializers.CharField(source='customer.customer_name', read_only=True)
    
    class Meta:
        model=Invoice
        fields='__all__'
        read_only_fields = ('total_amount',)

    def create(self, validated_data):
        # extract nested invoice items
        items_data = validated_data.pop('items')
        total_amount = 0

        # create the main invoice (total_amount will be calculated)
        invoice = Invoice.objects.create(total_amount=0, **validated_data)

        # create each invoice item linked to this invoice
        for item_data in items_data:
            # The medicine field is already validated and is a Medicine instance
            medicine = item_data['medicine']
            quantity = item_data['quantity']
            price = item_data['price']
            
            # Calculate subtotal for this item
            subtotal = quantity * price
            total_amount += subtotal
            
            # Update stock
            medicine.stock -= quantity
            if medicine.stock < 0:
                medicine.stock = 0
            medicine.save()
            
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        # Update invoice total
        invoice.total_amount = total_amount
        invoice.save()

        return invoice
    
    def update(self, instance, validated_data):
        # For updates, handle items if provided
        items_data = validated_data.pop('items', None)
        
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Recalculate total
            total_amount = 0
            for item_data in items_data:
                medicine = item_data['medicine']
                quantity = item_data['quantity']
                price = item_data['price']
                
                subtotal = quantity * price
                total_amount += subtotal
                
                InvoiceItem.objects.create(invoice=instance, **item_data)
            
            instance.total_amount = total_amount
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance