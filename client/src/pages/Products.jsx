import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The filters live in the address bar
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [searchText, setSearchText] = useState(search);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Change one filter in the address bar
  const updateParam = (key, value) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  // Load the categories once, for the filter dropdown
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Wait until the visitor stops typing, then apply the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim() !== search) {
        updateParam('search', searchText.trim());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]); // eslint-disable-line

  // Load the products whenever a filter changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/products', {
          params: { search, category, sort },
        });
        setProducts(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Could not load products. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, category, sort]);

  const clearFilters = () => {
    setSearchText('');
    setSearchParams({});
  };

  const hasFilters = search || category || sort !== 'newest';

  const inputClass =
    'rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800">All products</h1>

      {/* Search, filter and sort */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search products..."
          className={inputClass}
          aria-label="Search products"
        />

        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className={inputClass}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className={inputClass}
          aria-label="Sort products"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 && !error ? (
        <div className="mt-10 text-center text-gray-500">
          <p className="text-lg">No products match your search.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-indigo-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <span>
              {products.length} product{products.length === 1 ? '' : 's'} found
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-6 grid-cols-2 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Products;