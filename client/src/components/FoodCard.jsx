import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/pricing';
import toast from 'react-hot-toast';
import { useCanteen } from '../context/CanteenContext';
import { Link } from 'react-router-dom';

const isNewItem = (createdAt) => {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= 7 * 24 * 60 * 60 * 1000;
};

const FoodCard = ({ food }) => {
  const { addToCart, cart, updateQuantity } = useCart();
  const { isOpen } = useCanteen();
  const inCart = cart.find((item) => item._id === food._id);
  const qty = inCart?.quantity || 0;
  const rating =
    food.ratingCount > 0 ? (food.ratingAvg || 0).toFixed(1) : null;
  const tags = Array.isArray(food.tags) ? food.tags : [];
  const showNew = food.createdAt ? isNewItem(food.createdAt) : false;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <Link
      to={`/food/${food._id}`}
      id={`food-${food._id}`}
      className="block overflow-hidden rounded-2xl border border-cream bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#FFE0B2] to-[#FFCC80]">
        <img
          src={food.image}
          alt={food.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400/sample.jpg';
          }}
        />
        <span className="absolute right-2 top-2 rounded-md bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {food.category}
        </span>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {showNew && (
            <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
              🆕 New
            </span>
          )}
          {tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white"
            >
              {t}
            </span>
          ))}
        </div>
        {!food.available && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-dark">{food.name}</h2>
        {food.description && (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-neutral-400">
            {food.description}
          </p>
        )}
        <p className="mt-1 text-[10px] text-neutral-400">
          {rating ? `⭐ ${rating}` : '⭐ New'}
          <span className="mx-1">·</span>
          ~15 min
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">₹{formatPrice(food.price)}</span>
          {qty > 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-primary px-2 py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(food._id, qty - 1);
                }}
                className="text-sm font-bold text-white"
              >
                −
              </button>
              <span className="min-w-[1ch] text-center text-xs font-bold text-white">{qty}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(food._id, qty + 1);
                }}
                className="text-sm font-bold text-white"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!food.available || !isOpen}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-lg font-bold text-white disabled:opacity-50"
            >
              +
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;
