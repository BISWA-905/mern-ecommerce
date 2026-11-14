import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Stars from '../components/Stars';
import { formatPrice } from '../utils/format';

function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load this product whenever the id in the address changes
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setActiveImage(0);
      setQuantity(1);
      setMessage({ type: '', text: '' });
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setProduct(null);
        setError(
          err.response?.status === 404 || err.response?.status === 400
            ? 'We could not find this product.'
            : 'Could not load this product. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    // Only logged-in people have a cart
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setAdding(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/cart', { productId: product._id, quantity });
      setMessage({ type: 'success', text: 'Added to your cart.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Could not add this item to your cart. Please try again.',
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-1/3 rounded bg-gray-200 animate-pulse" />
          <div className="h-24 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-600">{error}</p>
        <Link
          to="/products"
          className="inline-block mt-4 text-indigo-600 hover:underline"
        >
          Back to all products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const outOfStock = product.stock === 0;
  const reviews = product.reviews || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/products" className="text-sm text-indigo-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Pictures */}
        <div>
          <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                    index === activeImage
                      ? 'border-indigo-600'
                      : 'border-transparent'
                  }`}
                  aria-label={`Show picture ${index + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category?.name && (
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            {product.name}
          </h1>

          <div className="mt-2">
            <Stars rating={product.rating} count={product.numReviews} />
          </div>

          <p className="mt-4 text-3xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <p
            className={`mt-4 text-sm font-medium ${
              outOfStock ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {outOfStock
              ? 'Out of stock'
              : product.stock <= 5
              ? `Only ${product.stock} left in stock`
              : 'In stock'}
          </p>

          {/* Quantity and Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock || quantity <= 1}
                className="px-3 py-2 text-lg disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={outOfStock || quantity >= product.stock}
                className="px-3 py-2 text-lg disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
            >
              {adding ? 'Adding...' : 'Add to cart'}
            </button>
          </div>

          {message.text && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.text}{' '}
              {message.type === 'success' && (
                <Link to="/cart" className="font-semibold underline">
                  View cart
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800">
          Reviews and ratings
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-4 text-gray-500">
            There are no reviews yet for this product.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((review) => (
              <li
                key={review._id}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {review.user?.name || 'A customer'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-1">
                  <Stars rating={review.rating} />
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ProductDetails;