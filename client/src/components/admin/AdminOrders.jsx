import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Load the orders, and again whenever the status filter changes
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/orders', {
          params: filter ? { status: filter } : {},
        });
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load the orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [filter]);

  // Move an order to a new status
  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    if (
      status === 'Cancelled' &&
      !window.confirm('Cancel this order? The items will go back into stock.')
    ) {
      return;
    }

    setBusyId(order._id);
    setError('');
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { status });
      setOrders((list) =>
        list.map((o) => (o._id === order._id ? { ...o, status: data.status } : o))
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not change the order status.'
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {loading
            ? 'Loading...'
            : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
        </p>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
          aria-label="Filter orders by status"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-4 h-48 rounded-xl bg-gray-200 animate-pulse" />
      ) : orders.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="mt-4 bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order._id} className="align-top">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{order.user?.name || 'Deleted user'}</p>
                    <p className="text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.orderItems
                      .map((item) => `${item.name} × ${item.quantity}`)
                      .join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => changeStatus(order, e.target.value)}
                      disabled={busyId === order._id || order.status === 'Cancelled'}
                      className={`rounded-full px-3 py-1 text-xs font-medium border-0 ${
                        statusStyles[order.status] || 'bg-gray-100 text-gray-800'
                      } disabled:opacity-70`}
                      aria-label={`Status of order ${order._id.slice(-6)}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;