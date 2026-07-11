import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';
import { CANTEEN } from '../config/canteen';
import toast from 'react-hot-toast';

const getIstHour = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const hourPart = parts.find((p) => p.type === 'hour')?.value;
  const hour = Number(hourPart);
  return Number.isFinite(hour) ? hour : date.getHours();
};

const getMealPeriod = (date = new Date()) => {
  const h = getIstHour(date);
  if (h >= 6 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 22) return 'dinner';
  return 'snacks';
};

const periodLabel = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [dietMode, setDietMode] = useState('all'); // 'all' | 'veg' | 'nonveg'
  const [priceSort, setPriceSort] = useState('default'); // 'default' | 'low-to-high' | 'high-to-low'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-100' | '100-250' | 'over-250'
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [topCategoryItem, setTopCategoryItem] = useState(null);
  const { itemCount, totalPrice } = useCart();
  const { user } = useAuth();
  const { isOpen, refresh: refreshCanteen } = useCanteen();

  useEffect(() => {
    api.get('/food/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshCanteen();
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const url = selectedCategory
          ? `/food?category=${encodeURIComponent(selectedCategory)}`
          : '/food';
        const { data } = await api.get(url);
        setFoods(data);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const period = getMealPeriod();
        const { data } = await api.get(`/stats/trending?period=${period}`);
        setTrending(data?.items || []);
      } catch {
        setTrending([]);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const category = selectedCategory || categories?.[0] || '';
    if (!category) return;
    const fetchTop = async () => {
      try {
        const { data } = await api.get(
          `/stats/top-by-category?category=${encodeURIComponent(category)}&days=30`
        );
        setTopCategoryItem(data?.item || null);
      } catch {
        setTopCategoryItem(null);
      }
    };
    fetchTop();
  }, [selectedCategory, categories]);

  const detectIsVeg = (f) => {
    if (typeof f.isVeg === 'boolean') return f.isVeg;
    const name = (f.name || '').toLowerCase();
    const t = (Array.isArray(f.tags) ? f.tags : []).map((x) => String(x).toLowerCase());
    if (t.includes('vegetarian') || t.includes('veg')) return true;
    if (/\bveg\b/.test(name)) return true;
    if (/paneer|tofu|salad|idli|dosa|poha|biryani|rajma|dal|upma|sandwich|mango|gulab|cheese|brownie|ice cream|cheesecake/.test(name)) return true;
    return false;
  };

  const processedFoods = useMemo(() => {
    let result = foods;

    // 1. Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q)
      );
    }

    // 2. Diet mode filter
    if (dietMode !== 'all') {
      result = result.filter((f) => (dietMode === 'veg' ? detectIsVeg(f) : !detectIsVeg(f)));
    }

    // 3. Price range filter
    if (priceRange !== 'all') {
      result = result.filter((f) => {
        if (priceRange === 'under-100') return f.price <= 100;
        if (priceRange === '100-250') return f.price > 100 && f.price <= 250;
        if (priceRange === 'over-250') return f.price > 250;
        return true;
      });
    }

    // 4. Sorting
    if (priceSort === 'low-to-high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      // Default sorting (by trending/popularity if available, otherwise by rating)
      if (trending?.length && !search.trim()) {
        const rank = new Map(trending.map((t, idx) => [String(t.food?._id), idx]));
        result = [...result].sort((a, b) => {
          const ra = rank.has(String(a._id)) ? rank.get(String(a._id)) : Number.POSITIVE_INFINITY;
          const rb = rank.has(String(b._id)) ? rank.get(String(b._id)) : Number.POSITIVE_INFINITY;
          if (ra !== rb) return ra - rb;
          return (b.ratingAvg || 0) - (a.ratingAvg || 0);
        });
      } else {
        result = [...result].sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
      }
    }

    return result;
  }, [foods, search, dietMode, priceRange, priceSort, trending]);

  const period = getMealPeriod();

  return (
    <main className="pb-24 md:pb-8">
      <section className="bg-gradient-to-br from-primary via-primary-light to-[#FFA15A] px-4 pb-6 pt-4 sm:px-6">
        <p className="text-[10px] text-white/80">📍 Pickup at</p>
        <h1 className="text-lg font-bold text-white">{CANTEEN.name}</h1>
        <p className="mt-1 font-display text-xl font-bold leading-tight text-white">
          {CANTEEN.tagline} 🍔
        
        </p>
        <p className="text-xs text-white/85">{CANTEEN.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
          {CANTEEN.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-lg border border-cream/50 space-y-3.5">
          <div className="flex items-center gap-2 px-1">
            <span className="text-base">🔍</span>
            <input
              type="search"
              placeholder="Search dishes, snacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400 font-medium"
            />
          </div>
          
          <hr className="border-cream/70" />

          {/* Filter Options */}
          <div className="flex flex-col gap-3">
            {/* Diet & Sort row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Diet selection */}
              <div className="flex items-center gap-1 bg-cream/45 p-0.5 rounded-lg border border-cream">
                <button
                  type="button"
                  onClick={() => setDietMode('all')}
                  className={`rounded-md px-3 py-1 text-[11px] font-extrabold transition-all duration-150 ${
                    dietMode === 'all' ? 'bg-primary text-white shadow-sm' : 'text-neutral-600 hover:bg-cream/65'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setDietMode('veg')}
                  className={`rounded-md px-3 py-1 text-[11px] font-extrabold transition-all duration-150 ${
                    dietMode === 'veg' ? 'bg-green-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-cream/65'
                  }`}
                >
                  Veg
                </button>
                <button
                  type="button"
                  onClick={() => setDietMode('nonveg')}
                  className={`rounded-md px-3 py-1 text-[11px] font-extrabold transition-all duration-150 ${
                    dietMode === 'nonveg' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-cream/65'
                  }`}
                >
                  Non-Veg
                </button>
              </div>

              {/* Price Sort Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Sort By</span>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="rounded-lg border border-cream bg-surface px-3 py-1 text-[11px] font-extrabold text-neutral-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="default">⭐ Popularity</option>
                  <option value="low-to-high">₹ Price: Low to High</option>
                  <option value="high-to-low">₹ Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Price Range selection row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mr-1.5">Price</span>
              <button
                type="button"
                onClick={() => setPriceRange('all')}
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold border transition ${
                  priceRange === 'all' ? 'bg-dark text-white border-dark' : 'bg-surface text-neutral-600 border-cream hover:bg-cream/60'
                }`}
              >
                All Prices
              </button>
              <button
                type="button"
                onClick={() => setPriceRange('under-100')}
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold border transition ${
                  priceRange === 'under-100' ? 'bg-dark text-white border-dark' : 'bg-surface text-neutral-600 border-cream hover:bg-cream/60'
                }`}
              >
                Under ₹100
              </button>
              <button
                type="button"
                onClick={() => setPriceRange('100-250')}
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold border transition ${
                  priceRange === '100-250' ? 'bg-dark text-white border-dark' : 'bg-surface text-neutral-600 border-cream hover:bg-cream/60'
                }`}
              >
                ₹100 - ₹250
              </button>
              <button
                type="button"
                onClick={() => setPriceRange('over-250')}
                className={`rounded-full px-3 py-1 text-[10px] font-extrabold border transition ${
                  priceRange === 'over-250' ? 'bg-dark text-white border-dark' : 'bg-surface text-neutral-600 border-cream hover:bg-cream/60'
                }`}
              >
                Over ₹250
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-4 rounded-t-3xl bg-surface px-4 pb-6 pt-5 sm:px-6">
        <h2 className="mb-3 text-sm font-bold text-dark">Categories</h2>
        <FilterBar categories={categories} active={selectedCategory} onChange={setSelectedCategory} />

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-dark to-[#2D2D6E] p-4">
          <div>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
              TODAY
            </span>
            <p className="mt-1 text-sm font-bold text-white">
              {periodLabel[period] || 'Today'} Specials!
            </p>
            <p className="text-[10px] text-white/60">
              {isOpen ? 'Fresh meals from our kitchen' : 'Restaurant is closed right now'}
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-2xl">
            🍛
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-dark">
            Trending ({periodLabel[period] || 'Now'})
          </h2>
          <span className="text-[10px] text-neutral-400">
            ⭐ {CANTEEN.rating} · {CANTEEN.prepTime}
          </span>
        </div>

        {topCategoryItem?.food?._id && (
          <a
            href={`#food-${topCategoryItem.food._id}`}
            className="mt-2 inline-flex w-full items-center justify-between rounded-xl border border-cream bg-white px-3 py-2 text-xs font-semibold text-dark hover:bg-surface"
          >
            <span className="truncate">
              🔥 Most sold in{' '}
              <span className="text-primary">
                {selectedCategory || categories?.[0] || 'this category'}
              </span>
              : {topCategoryItem.food.name}
            </span>
            <span className="shrink-0 text-[10px] text-neutral-500">View →</span>
          </a>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : processedFoods.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">No items found.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-fade-in">
            {processedFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>

      {user?.role === 'customer' && itemCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-20 left-4 right-4 z-40 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
        >
          <span>
            🛒 {itemCount} item{itemCount !== 1 ? 's' : ''} · ₹{totalPrice}
          </span>
          <span>View Cart →</span>
        </Link>
      )}
    </main>
  );
};

export default Home;
