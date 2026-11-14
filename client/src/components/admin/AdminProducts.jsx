import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  images: '',
  isFeatured: false,
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the products.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      setError('Could not load the categories.');
    }
  };

  // Load products and categories when the tab opens
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category?._id || '',
      images: (product.images || []).join('\n'),
      isFeatured: product.isFeatured,
    });
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Add a new category from inside the form
  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setError('');
    try {
      const { data } = await api.post('/categories', { name });
      setCategories((list) =>
        [...list, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setForm((f) => ({ ...f, category: data._id }));
      setNewCategory('');
      setNotice(`Category "${data.name}" added.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add the category.');
    }
  };

  // Save a new product, or the changes to an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim() || !form.description.trim() || !form.category) {
      setError('Name, description and category are required');
      return;
    }
    if (form.price === '' || Number.isNaN(price) || price < 0) {
      setError('Price must be a number, 0 or more');
      return;
    }
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number, 0 or more');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category,
      isFeatured: form.isFeatured,
      images: form.images
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setNotice('Product updated.');
      } else {
        await api.post('/products', payload);
        setNotice('Product added.');
      }
      closeForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(product._id);
    setError('');
    setNotice('');
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((list) => list.filter((p) => p._id !== product._id));
      setNotice('Product deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the product.');
    } finally {
      setBusyId(null);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading
            ? 'Loading...'
            : `${products.length} product${products.length === 1 ? '' : 's'}`}
        </p>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Add product
          </button>
        )}
      </div>

      {notice && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Add / edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-white rounded-xl shadow-sm p-6 grid gap-4 sm:grid-cols-2"
        >
          <h3 className="sm:col-span-2 text-lg font-bold text-gray-800">
            {editingId ? 'Edit product' : 'Add a new product'}
          </h3>

          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="mt-2 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Or type a new category name"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="New category name"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                Add category
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Picture links (one per line)
            </label>
            <textarea
              id="images"
              name="images"
              rows={3}
              value={form.images}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            Show this product in "Featured products" on the home page
          </label>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Product list */}
      {loading ? (
        <div className="mt-4 h-48 rounded-xl bg-gray-200 animate-pulse" />
      ) : products.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">No products yet.</p>
      ) : (
        <div className="mt-4 bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-10 h-10 rounded object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                    {formatPrice(product.price)}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      product.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.isFeatured ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(product)}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(product)}
                        disabled={busyId === product._id}
                        className="text-red-600 hover:underline disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
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

export default AdminProducts;