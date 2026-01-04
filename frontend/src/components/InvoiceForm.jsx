import React, { useState, useEffect } from 'react';
import api from '../api';

const InvoiceForm = () => {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines/');
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { medicine: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;

    // If medicine is selected, update price
    if (field === 'medicine') {
      const medicine = medicines.find(m => m.id === parseInt(value));
      if (medicine) {
        updated[index].price = parseFloat(medicine.price);
      }
    }

    setInvoiceItems(updated);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.price));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      setMessage({ type: 'error', text: 'Please select a customer' });
      return;
    }

    if (invoiceItems.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one item' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const items = invoiceItems.map(item => ({
        medicine: parseInt(item.medicine),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      }));

      const invoiceData = {
        customer: parseInt(selectedCustomer),
        items: items
      };

      await api.post('/invoices/', invoiceData);
      setMessage({ type: 'success', text: 'Invoice created successfully!' });
      
      // Reset form
      setSelectedCustomer('');
      setInvoiceItems([]);
      
      // Refresh medicines (stock might have changed)
      fetchMedicines();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to create invoice' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Invoice</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_name} {customer.phone && `(${customer.phone})`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Add Item
            </button>
          </div>

          {invoiceItems.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No items added. Click "Add Item" to start.</p>
          ) : (
            <div className="space-y-3">
              {invoiceItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <select
                      value={item.medicine}
                      onChange={(e) => updateItem(index, 'medicine', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select medicine</option>
                      {medicines.map(medicine => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} - ₹{medicine.price} (Stock: {medicine.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Price"
                      required
                    />
                  </div>
                  <div className="w-24 pt-2 text-right font-semibold">
                    ₹{(parseFloat(item.quantity) * parseFloat(item.price)).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;

