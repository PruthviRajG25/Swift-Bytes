import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';
import api from '../services/api';
import { GST_RATE, formatPrice, calcTotalWithGst } from '../utils/pricing';
import { CANTEEN } from '../config/canteen';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import FoodCard from '../components/FoodCard';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { isOpen, loading: canteenLoading, refresh: refreshCanteen } = useCanteen();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [pairLoading, setPairLoading] = useState(false);
  const [pairs, setPairs] = useState([]);

  const gstAmount = totalPrice * GST_RATE;
  const grandTotal = calcTotalWithGst(totalPrice);
  const baseFoodId = useMemo(() => cart?.[0]?._id || '', [cart]);

  useEffect(() => {
    const run = async () => {
      if (!baseFoodId) return;
      setPairLoading(true);
      try {
        const { data } = await api.get(`/food/${baseFoodId}/pairs?days=30&limit=4`);
        setPairs(data?.items?.map((x) => x.food) || []);
      } catch {
        setPairs([]);
      } finally {
        setPairLoading(false);
      }
    };
    run();
  }, [baseFoodId]);

  const placeOrder = async () => {
    await refreshCanteen();
    if (!isOpen) {
      toast.error('Restaurant is currently closed');
      return;
    }
    if (!user) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const items = cart.map((item) => ({
        food: item._id,
        quantity: item.quantity,
      }));
      const { data } = await api.post('/orders', {
        items,
        instructions,
        paymentMethod,
      });
      clearCart();
      toast.success(`Order placed! Token #${data.tokenNumber}`);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center pb-28">
        <p className="mb-4 text-lg text-neutral-600">Your cart is empty</p>
        <Link
          to="/"
          className="inline-block rounded-xl bg-gradient-to-r from-primary to-primary-light px-8 py-3 font-bold text-white"
        >
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg bg-surface pb-32 md:pb-8">
      <header className="border-b border-cream bg-white px-4 py-4">
        <h1 className="text-lg font-extrabold text-dark">🛒 Your Cart</h1>
        <p className="text-xs text-neutral-400">
          {CANTEEN.name} · {cart.length} item{cart.length !== 1 ? 's' : ''}
        </p>
      </header>

      {!isOpen && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          Restaurant is closed right now. You can review your cart, but ordering is disabled.
        </div>
      )}

      <div className="space-y-3 px-4 py-4">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-xl border border-cream bg-white p-3"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-dark">{item.name}</h3>
              {item.description && (
                <p className="line-clamp-1 text-[10px] text-neutral-400">{item.description}</p>
              )}
              <p className="text-xs text-neutral-500">{item.category}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF3E0] text-sm font-bold text-primary"
                >
                  −
                </button>
                <span className="text-xs font-bold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF3E0] text-sm font-bold text-primary"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-dark">₹{formatPrice(item.price * item.quantity)}</p>
              <button
                type="button"
                onClick={() => removeFromCart(item._id)}
                className="mt-1 text-[10px] text-neutral-400 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 rounded-xl border border-dashed border-primary-light bg-white p-4">
        <p className="text-sm font-semibold text-primary">Bill Summary</p>
        <div className="mt-3 space-y-2 text-xs text-neutral-600">
          <div className="flex justify-between">
            <span>Item total</span>
            <span>₹{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({GST_RATE * 100}%)</span>
            <span>₹{formatPrice(gstAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-cream pt-2 text-base font-bold text-dark">
            <span>To pay</span>
            <span className="text-primary">₹{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-xl border border-cream bg-white p-4">
        <p className="text-sm font-semibold text-dark">Optional instructions</p>
        <p className="mt-1 text-[10px] text-neutral-400">
          Example: less spicy, no onion, extra chutney.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Add a note for the chef (optional)"
          className="mt-3 w-full resize-none rounded-xl border border-cream bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="mx-4 mt-4 rounded-xl border border-cream bg-white p-4">
        <p className="text-sm font-semibold text-dark">Payment</p>
        <div className="mt-3 flex gap-2">
          {['Cash', 'UPI'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold ${
                paymentMethod === m
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-cream bg-surface text-neutral-700'
              }`}
            >
              {m === 'Cash' ? '💵 Cash' : '📱 UPI'}
            </button>
          ))}
        </div>
        {paymentMethod === 'UPI' && (
          <p className="mt-2 text-[10px] text-neutral-500">
            Pay via UPI and show the confirmation at pickup. (UPI verification can be handled by admin.)
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={placeOrder}
        disabled={loading || canteenLoading || !isOpen}
        className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : !isOpen ? (
          'Restaurant Closed'
        ) : (
          `Place Order · ₹${formatPrice(grandTotal)}`
        )}
      </button>

      <div className="mx-4 mt-6 pb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-dark">🤝 Pairs well with</p>
          <p className="text-[10px] text-neutral-400">Based on popular combos</p>
        </div>
        {pairLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="sm" />
          </div>
        ) : pairs.length === 0 ? (
          <p className="py-6 text-xs text-neutral-500">No recommendations yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pairs.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
