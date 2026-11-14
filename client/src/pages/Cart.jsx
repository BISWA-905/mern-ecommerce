import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/format';

function Cart() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Load my cart when the page opens
  useEffect(() => {
    const loadCart = async () => {
      try {
        const { data } = await api.get('/cart');
        setCart(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load your cart. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Change how many of one product I want
  const changeQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    setBusyId(productId);
    setError('');
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not update the quantity.'
      );
    } finally {
      setBusyId(null);
    }
  };

  // Take one product out of the cart
  const removeItem = async (productId) => {
    setBusyId(productId);
    setError('');
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove the item.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">Your cart</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-gray-500">Your cart is empty.</p>
          <Link
            to="/products"
            className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Items */}
          <ul className="space-y-4">
            {cart.items.map(({ product, quantity, subtotal }) => (
              <li
                key={product._id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
              >
                <Link to={`/products/${product._id}`} className="shrink-0">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-24 h-24 rounded-lg object-cover bg-gray-100"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-semibold text-gray-800 hover:text-indigo-600"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {formatPrice(product.price)} each
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => changeQuantity(product._id, quantity - 1)}
                        disabled={busyId === product._id || quantity <= 1}
                        className="px-3 py-1 text-lg disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => changeQuantity(product._id, quantity + 1)}
                        disabled={
                          busyId === product._id || quantity >= product.stock
                        }
                        className="px-3 py-1 text-lg disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product._id)}
                      disabled={busyId === product._id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="font-bold text-gray-800">{formatPrice(subtotal)}</p>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-800">Order summary</h2>
            <div className="mt-4 flex justify-between text-gray-600">
              <span>
                Items (
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
              <span>{formatPrice(cart.totalPrice)}</span>
            </div>
            <div className="mt-2 flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(cart.totalPrice)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;