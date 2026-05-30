import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import CloudinaryImageField from '../../components/CloudinaryImageField';
import { CANTEEN } from '../../config/canteen';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  image: '',
  available: true,
  tags: '',
};

const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Dessert'];
const CUSTOM_CATEGORY_VALUE = '__custom__';

const ManageMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryMode, setCategoryMode] = useState('preset'); // preset | custom
  const [customCategory, setCustomCategory] = useState('');

  const fetchFoods = async () => {
    try {
      const { data } = await api.get('/food');
      setFoods(data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      price: Number(form.price),
      available: form.available === true || form.available === 'true',
      tags: String(form.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6),
    };
    try {
      if (editingId) {
        const { data } = await api.put(`/food/${editingId}`, payload);
        setFoods((prev) => prev.map((f) => (f._id === editingId ? data : f)));
        toast.success('Item updated');
      } else {
        const { data } = await api.post('/food', payload);
        setFoods((prev) => [data, ...prev]);
        toast.success('Item added');
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (food) => {
    setEditingId(food._id);
    const isPreset = DEFAULT_CATEGORIES.some(
      (c) => c.toLowerCase() === String(food.category || '').toLowerCase()
    );
    setCategoryMode(isPreset ? 'preset' : 'custom');
    setCustomCategory(isPreset ? '' : food.category);
    setForm({
      name: food.name,
      category: food.category,
      description: food.description || '',
      price: String(food.price),
      image: food.image,
      available: food.available,
      tags: Array.isArray(food.tags) ? food.tags.join(', ') : '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/food/${id}`);
      setFoods((prev) => prev.filter((f) => f.id !== id && f._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-dark">Manage Menu</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {CANTEEN.name} — add items with name, category, description, price, and image.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-2xl border border-cream bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <input
          placeholder="Item name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="rounded-xl border border-cream px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="grid gap-2">
          <select
            value={categoryMode === 'custom' ? CUSTOM_CATEGORY_VALUE : form.category}
            onChange={(e) => {
              const value = e.target.value;
              if (value === CUSTOM_CATEGORY_VALUE) {
                setCategoryMode('custom');
                setForm({ ...form, category: customCategory || '' });
                return;
              }
              setCategoryMode('preset');
              setCustomCategory('');
              setForm({ ...form, category: value });
            }}
            required
            className="rounded-xl border border-cream bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>
              Select category *
            </option>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={CUSTOM_CATEGORY_VALUE}>Custom…</option>
          </select>
          {categoryMode === 'custom' && (
            <input
              placeholder="Custom category (e.g. Sandwiches) *"
              value={customCategory}
              onChange={(e) => {
                const value = e.target.value;
                setCustomCategory(value);
                setForm({ ...form, category: value });
              }}
              required
              className="rounded-xl border border-cream px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
        <textarea
          placeholder="Description shown to students *"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          rows={3}
          className="sm:col-span-2 rounded-xl border border-cream px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="number"
          placeholder="Price (₹) *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          min="0"
          className="rounded-xl border border-cream px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="rounded text-primary"
          />
          Available on menu
        </label>
        <input
          placeholder="Tags (comma separated) e.g. Bestseller, Spicy"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="rounded-xl border border-cream px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <div className="sm:col-span-2">
          <CloudinaryImageField
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
          />
        </div>

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-6 py-2.5 font-bold text-white disabled:opacity-60"
          >
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setCategoryMode('preset');
                setCustomCategory('');
              }}
              className="rounded-xl bg-surface px-6 py-2.5 font-medium text-neutral-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-cream bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream bg-surface">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Item</th>
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food._id} className="border-b border-cream/80">
                <td className="p-4">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                </td>
                <td className="p-4 font-semibold text-dark">{food.name}</td>
                <td className="max-w-xs p-4 text-xs text-neutral-500 line-clamp-2">
                  {food.description || '—'}
                </td>
                <td className="p-4">{food.category}</td>
                <td className="p-4 font-semibold text-primary">₹{food.price}</td>
                <td className="p-4 text-xs">
                  {food.ratingCount > 0
                    ? `⭐ ${food.ratingAvg.toFixed(1)} (${food.ratingCount})`
                    : '—'}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(food)}
                    className="mr-2 font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(food._id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMenu;


