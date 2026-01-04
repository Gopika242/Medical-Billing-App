import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MedicineList from './components/MedicineList';
import CustomerList from './components/CustomerList';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Billing App</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors duration-150`}
              >
                Dashboard
              </Link>
              <Link
                to="/medicines"
                className={`${isActive('/medicines')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors duration-150`}
              >
                Medicines
              </Link>
              <Link
                to="/customers"
                className={`${isActive('/customers')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors duration-150`}
              >
                Customers
              </Link>
              <Link
                to="/invoices"
                className={`${isActive('/invoices')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors duration-150`}
              >
                Invoices
              </Link>
              <Link
                to="/create-invoice"
                className={`${isActive('/create-invoice')} inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors duration-150`}
              >
                Create Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${isActive('/')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
          >
            Dashboard
          </Link>
          <Link
            to="/medicines"
            className={`${isActive('/medicines')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
          >
            Medicines
          </Link>
          <Link
            to="/customers"
            className={`${isActive('/customers')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
          >
            Customers
          </Link>
          <Link
            to="/invoices"
            className={`${isActive('/invoices')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
          >
            Invoices
          </Link>
          <Link
            to="/create-invoice"
            className={`${isActive('/create-invoice')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-150`}
          >
            Create Invoice
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/create-invoice" element={<InvoiceForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
