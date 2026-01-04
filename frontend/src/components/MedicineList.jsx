import React, { useEffect, useState } from 'react';
import api from '../api';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: ''
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get('/medicines/', { params });
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setMessage({ type: 'error', text: 'Failed to fetch medicines' });
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMedicines();
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
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      };

      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.id}/`, submitData);
        setMessage({ type: 'success', text: 'Medicine updated successfully!' });
      } else {
        await api.post('/medicines/', submitData);
        setMessage({ type: 'success', text: 'Medicine created successfully!' });
      }
      
      resetForm();
      fetchMedicines();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving medicine:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save medicine' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      price: medicine.price,
      stock: medicine.stock,
      description: medicine.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      await api.delete(`/medicines/${id}/`);
      setMessage({ type: 'success', text: 'Medicine deleted successfully!' });
      fetchMedicines();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to delete medicine' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      description: ''
    });
    setEditingMedicine(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Medicines</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          {showForm ? 'Cancel' : '+ Add Medicine'}
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
            {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
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
              {loading ? 'Saving...' : editingMedicine ? 'Update' : 'Create'}
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
          placeholder="Search medicines..."
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Price (₹)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No medicines found. Add a new medicine to get started.
                </td>
              </tr>
            ) : (
              medicines.map(medicine => (
                <tr 
                  key={medicine.id} 
                  className={`hover:bg-gray-50 transition ${
                    medicine.stock === 0 ? 'bg-red-50' : medicine.stock < 10 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 border-b text-gray-700">{medicine.id}</td>
                  <td className="px-4 py-3 border-b text-gray-700 font-medium">{medicine.name}</td>
                  <td className="px-4 py-3 border-b text-gray-700">₹{parseFloat(medicine.price).toFixed(2)}</td>
                  <td className="px-4 py-3 border-b text-gray-700">
                    <span className={`font-semibold ${
                      medicine.stock === 0 ? 'text-red-600' : medicine.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {medicine.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b text-gray-700 max-w-xs truncate">{medicine.description || '-'}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
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

export default MedicineList;
