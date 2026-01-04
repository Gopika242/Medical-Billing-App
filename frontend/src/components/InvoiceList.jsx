import React, { useEffect, useState } from 'react';
import api from '../api';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [filterCustomer]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = filterCustomer ? { customer: filterCustomer } : {};
      const res = await api.get('/invoices/', { params });
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}/`);
      fetchInvoices();
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice');
    }
  };

  const viewInvoiceDetails = async (invoice) => {
    try {
      const res = await api.get(`/invoices/${invoice.id}/`);
      setSelectedInvoice(res.data);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
    }
  };

  const downloadPDF = async (invoiceId, e) => {
    e.stopPropagation(); // Prevent row click
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf/`, {
        responseType: 'blob',
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
        <div className="flex gap-4 items-center">
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice List */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Invoice ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No invoices found. Create your first invoice!
                      </td>
                    </tr>
                  ) : (
                    invoices.map(invoice => (
                      <tr 
                        key={invoice.id} 
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          selectedInvoice?.id === invoice.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => viewInvoiceDetails(invoice)}
                      >
                        <td className="px-4 py-3 border-b text-gray-700 font-semibold">#{invoice.id}</td>
                        <td className="px-4 py-3 border-b text-gray-700">{invoice.customer_name}</td>
                        <td className="px-4 py-3 border-b text-gray-700">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700 font-semibold">
                          ₹{parseFloat(invoice.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 border-b" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewInvoiceDetails(invoice)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => downloadPDF(invoice.id, e)}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                            >
                              PDF
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="lg:col-span-1">
            {selectedInvoice ? (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Invoice Details</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Invoice ID:</span>
                    <div className="text-lg font-semibold text-gray-800">#{selectedInvoice.id}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Customer:</span>
                    <div className="text-lg font-semibold text-gray-800">{selectedInvoice.customer_name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <div className="text-gray-800">{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedInvoice.items?.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <div className="font-medium text-gray-800">{item.medicine_name || `Medicine #${item.medicine}`}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)} = ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{parseFloat(selectedInvoice.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => downloadPDF(selectedInvoice.id, e)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center text-gray-500">
                Select an invoice to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;

