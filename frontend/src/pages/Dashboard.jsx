import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    lowStockMedicines: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentInvoices();
  }, []);

  const fetchStats = async () => {
    try {
      const [medicinesRes, customersRes, invoicesRes] = await Promise.all([
        api.get('/medicines/'),
        api.get('/customers/'),
        api.get('/invoices/')
      ]);

      const medicines = medicinesRes.data;
      const invoices = invoicesRes.data;

      const lowStock = medicines.filter(m => m.stock < 10).length;
      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

      setStats({
        totalMedicines: medicines.length,
        totalCustomers: customersRes.data.length,
        totalInvoices: invoices.length,
        lowStockMedicines: lowStock,
        totalRevenue: totalRevenue
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const res = await api.get('/invoices/');
      const invoices = res.data.slice(0, 5); // Get latest 5 invoices
      setRecentInvoices(invoices);
    } catch (err) {
      console.error('Error fetching recent invoices:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Medicines</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalMedicines}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Customers</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalCustomers}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Invoices</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalInvoices}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Low Stock Items</div>
            <div className="text-3xl font-bold text-red-600">{stats.lowStockMedicines}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm font-medium mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-indigo-600">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Invoices</h2>
          {recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No invoices yet. Create your first invoice!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Invoice ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 border-b text-gray-700">#{invoice.id}</td>
                      <td className="px-4 py-3 border-b text-gray-700">{invoice.customer_name}</td>
                      <td className="px-4 py-3 border-b text-gray-700">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-700 font-semibold">
                        ₹{parseFloat(invoice.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

