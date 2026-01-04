# from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from .models import *
from .serializers import *


# Create your views here.
class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all().order_by('-id')
    serializer_class = MedicineSerializer
    
    def get_queryset(self):
        queryset = Medicine.objects.all().order_by('-id')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-id')
    serializer_class = CustomerSerializer
    
    def get_queryset(self):
        queryset = Customer.objects.all().order_by('-id')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(customer_name__icontains=search)
        return queryset

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-id')
    serializer_class = InvoiceSerializer
    
    def get_queryset(self):
        queryset = Invoice.objects.all().order_by('-id')
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for an invoice"""
        try:
            invoice = self.get_object()
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)
        
        # Create HttpResponse object with PDF headers
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.id}.pdf"'
        
        # Create the PDF object
        doc = SimpleDocTemplate(response, pagesize=A4)
        story = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=12,
        )
        normal_style = styles['Normal']
        
        # Title
        story.append(Paragraph("INVOICE", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Invoice details
        invoice_data = [
            ['Invoice ID:', f'#{invoice.id}'],
            ['Date:', invoice.date.strftime('%B %d, %Y')],
            ['Customer:', invoice.customer.customer_name],
        ]
        if invoice.customer.phone:
            invoice_data.append(['Phone:', invoice.customer.phone])
        if invoice.customer.address:
            invoice_data.append(['Address:', invoice.customer.address])
        
        invoice_table = Table(invoice_data, colWidths=[2*inch, 4*inch])
        invoice_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(invoice_table)
        story.append(Spacer(1, 0.4*inch))
        
        # Items table
        story.append(Paragraph("Items", heading_style))
        
        # Table data
        table_data = [['Item', 'Quantity', 'Unit Price', 'Total']]
        
        for item in invoice.items.all():
            item_name = item.medicine.name
            quantity = str(item.quantity)
            unit_price = f"₹{float(item.price):.2f}"
            total = f"₹{float(item.quantity * item.price):.2f}"
            table_data.append([item_name, quantity, unit_price, total])
        
        # Create table
        items_table = Table(table_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        story.append(items_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Total
        total_style = ParagraphStyle(
            'TotalStyle',
            parent=styles['Normal'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold',
        )
        total_text = f"Total Amount: ₹{float(invoice.total_amount):.2f}"
        story.append(Paragraph(total_text, total_style))
        
        # Build PDF
        doc.build(story)
        
        return response