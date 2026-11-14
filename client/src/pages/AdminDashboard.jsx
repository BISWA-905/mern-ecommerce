import { useState } from 'react';
import AdminUsers from '../components/admin/AdminUsers';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';

const tabs = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'users', label: 'Users' },
];

function ComingSoon({ name }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
      The {name} tab is coming soon.
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin dashboard</h1>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* The open drawer */}
      <div className="mt-6">
               {activeTab === 'products' && <AdminProducts />}
               {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
}

export default AdminDashboard;