import React, { useEffect, useState } from 'react';
import api from '../api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get('/customers/', { params });
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setMessage({ type: 'error', text: 'Failed to fetch customers' });
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}/`, formData);
        setMessage({ type: 'success', text: 'Customer updated successfully!' });
      } else {
        await api.post('/customers/', formData);
        setMessage({ type: 'success', text: 'Customer created successfully!' });
      }
      
      resetForm();
      fetchCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving customer:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save customer' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name,
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await api.delete(`/customers/${id}/`);
      setMessage({ type: 'success', text: 'Customer deleted successfully!' });
      fetchCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error deleting customer:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to delete customer' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      phone: '',
      address: ''
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No customers found. Add a new customer to get started.
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 border-b text-gray-700">{customer.id}</td>
                  <td className="px-4 py-3 border-b text-gray-700 font-medium">{customer.customer_name}</td>
                  <td className="px-4 py-3 border-b text-gray-700">{customer.phone || '-'}</td>
                  <td className="px-4 py-3 border-b text-gray-700">{customer.address || '-'}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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
  );
};

export default CustomerList;

