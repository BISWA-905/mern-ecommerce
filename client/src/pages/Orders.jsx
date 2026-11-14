import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/format';

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function Orders() {
  const location = useLocation();
  const justPlaced = location.state?.placed;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load my orders when the page opens
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load your orders. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="h-40 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">My orders</h1>

      {justPlaced && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3">
          Your order has been placed. Thank you for shopping with us!
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-gray-500">You have not placed any orders yet.</p>
          <Link
            to="/products"
            className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-6">
          {orders.map((order) => (
            <li key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order header */}
              <div className="px-4 py-3 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusStyles[order.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y">
                {order.orderItems.map((item) => (
                  <li key={item._id} className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product}`}
                        className="font-medium text-gray-800 hover:text-indigo-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 flex flex-wrap items-start justify-between gap-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Deliver to:</span>{' '}
                  {order.shippingAddress.fullName}, {order.shippingAddress.address},{' '}
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  Total: {formatPrice(order.totalPrice)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Orders;