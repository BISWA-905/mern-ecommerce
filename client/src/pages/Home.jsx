import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // When the page opens, ask the backend for featured products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products', { params: { featured: true, limit: 8 } }),
          api.get('/categories'),
        ]);
        setFeatured(productsRes.data);
        setCategories(categoriesRes.data);
      } catch {
        setError('Could not load the shop right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Gadgets you will love,
            <br className="hidden md:block" /> delivered to your door.
          </h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto md:mx-0">
            Discover our latest and most popular products at friendly prices.
          </p>
          <Link
            to="/products"
            className="inline-block mt-8 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50"
          >
            Shop now
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {error && (
          <div className="mt-8 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {/* Featured products */}
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Featured products
            </h2>
            <Link to="/products" className="text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="mt-6 text-gray-500">No featured products yet.</p>
          ) : (
            <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800">Shop by category</h2>

          {loading ? (
            <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="mt-6 text-gray-500">No categories yet.</p>
          ) : (
            <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 text-center"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    {category.name.charAt(0)}
                  </div>
                  <p className="mt-3 font-semibold text-gray-800">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;