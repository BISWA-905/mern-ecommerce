import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

const fields = [
  { name: 'fullName', label: 'Full name', type: 'text', wide: true },
  { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '10 digits' },
  { name: 'postalCode', label: 'Postal code', type: 'text', placeholder: '6 digits' },
  { name: 'address', label: 'Address', type: 'text', wide: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'country', label: 'Country', type: 'text', wide: true },
];

function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    postalCode: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });

  // Load my cart, to show the order summary
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check the form before sending it
    const anyEmpty = Object.values(form).some((value) => !value.trim());
    if (anyEmpty) {
      setError('Please fill in all the shipping details');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (!/^\d{6}$/.test(form.postalCode.trim())) {
      setError('Postal code must be exactly 6 digits');
      return;
    }

    setPlacing(true);
    try {
      await api.post('/orders', { shippingAddress: form });
      navigate('/orders', { state: { placed: true }, replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not place your order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">
          Your cart is empty, so there is nothing to check out.
        </p>
        <Link
          to="/products"
          className="inline-block mt-4 text-indigo-600 hover:underline"
        >
          Go to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        {/* Shipping form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 grid gap-4 sm:grid-cols-2 h-fit"
        >
          <h2 className="sm:col-span-2 text-lg font-bold text-gray-800">
            Shipping address
          </h2>

          {fields.map((field) => (
            <div key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          <p className="sm:col-span-2 text-sm text-gray-500">
            Payment method: <strong>Cash on Delivery</strong>
          </p>

          <button
            type="submit"
            disabled={placing}
            className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
          >
            {placing ? 'Placing your order...' : 'Place order'}
          </button>
        </form>

        {/* Order summary */}
        <aside className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800">Order summary</h2>

          <ul className="mt-4 space-y-3">
            {cart.items.map(({ product, quantity, subtotal }) => (
              <li key={product._id} className="flex gap-3 text-sm">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-12 h-12 rounded object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-gray-500">Qty: {quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">
                  {formatPrice(subtotal)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t flex justify-between text-gray-600">
            <span>Delivery</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;