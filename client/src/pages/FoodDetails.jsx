import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useCanteen } from '../context/CanteenContext';
import toast from 'react-hot-toast';

const isNewItem = (createdAt) => {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= 7 * 24 * 60 * 60 * 1000;
};

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, updateQuantity } = useCart();
  const { isOpen } = useCanteen();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/food/${id}`);
        setFood(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const inCart = useMemo(() => cart.find((x) => x._id === id), [cart, id]);
  const qty = inCart?.quantity || 0;
  const tags = Array.isArray(food?.tags) ? food.tags : [];
  const showNew = food?.createdAt ? isNewItem(food.createdAt) : false;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!food) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm text-neutral-500">Item not found.</p>
        <Link to="/" className="mt-4 inline-block font-bold text-primary hover:underline">
          Back to menu
        </Link>
      </main>
    );
  }

  const handleAdd = () => {
    if (!isOpen) {
      toast.error('Restaurant is currently closed');
      return;
    }
    if (!food.available) {
      toast.error('This item is unavailable');
      return;
    }
    addToCart(food);
    toast.success(`${food.name} added`);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <Link to="/" className="text-sm font-bold text-primary hover:underline">
        ← Back
      </Link>

      <section className="mt-4 overflow-hidden rounded-2xl border border-cream bg-white shadow-sm">
        <div className="relative aspect-[16/9] bg-surface">
          <img src={food.image} alt={food.name} className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {showNew && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
                🆕 New
              </span>
            )}
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold text-white"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold text-dark">{food.name}</h1>
              <p className="mt-1 text-xs font-semibold text-neutral-500">{food.category}</p>
            </div>
            <p className="shrink-0 text-lg font-extrabold text-primary">₹{food.price}</p>
          </div>

          {food.description && <p className="mt-3 text-sm text-neutral-600">{food.description}</p>}

          <div className="mt-5 flex items-center justify-between border-t border-cream pt-4">
            {qty > 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(food._id, qty - 1)}
                  className="text-lg font-bold text-white"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-sm font-extrabold text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(food._id, qty + 1)}
                  className="text-lg font-bold text-white"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={!food.available || !isOpen}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-6 py-3 text-sm font-extrabold text-white disabled:opacity-60"
              >
                Add to cart
              </button>
            )}

            <span className="text-xs text-neutral-500">
              {food.available ? (isOpen ? 'Available' : 'Canteen closed') : 'Sold out'}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FoodDetails;

