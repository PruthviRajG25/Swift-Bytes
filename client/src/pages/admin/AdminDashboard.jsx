import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CANTEEN } from '../../config/canteen';
import toast from 'react-hot-toast';
import { useCanteen } from '../../context/CanteenContext';
import DailyInvoiceModal from '../../components/admin/DailyInvoiceModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, refresh: refreshCanteen } = useCanteen();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [showDailyInvoice, setShowDailyInvoice] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/stats');
      setStats(data);
    } catch {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    refreshCanteen();
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.on('newOrder', () => {
      setUnreadOrders((n) => n + 1);
      toast.success('🛎️ New order received');
      fetchStats();
    });
    socket.on('orderStatusChanged', fetchStats);
    return () => {
      socket.off('newOrder');
      socket.off('orderStatusChanged', fetchStats);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const maxCount = stats?.mostOrdered?.[0]?.count || 1;

  const cards = [
    { icon: '📦', label: 'Orders Today', value: stats?.ordersToday ?? 0 },
    { icon: '💰', label: "Today's Revenue", value: `₹${stats?.revenue ?? 0}` },
    { icon: '⏱', label: 'Active Orders', value: stats?.activeOrders ?? 0 },
    {
      icon: '⭐',
      label: 'Avg Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '—',
      sub: stats?.reviewCount ? `${stats.reviewCount} reviews` : 'No reviews yet',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cream bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/swiftbites-logo.svg"
            alt="SwiftBites Bites"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-dark">SwiftBites Bites — Admin</h1>
            <p className="text-xs text-neutral-400">{CANTEEN.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/alerts"
            onClick={() => setUnreadOrders(0)}
            className="relative rounded-xl border border-cream bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-surface"
            title="New orders notifications"
          >
            🔔 Alerts
            {unreadOrders > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-white">
                {unreadOrders}
              </span>
            )}
          </Link>
          <span
            className={`rounded-lg px-3 py-1 text-xs font-bold ${
              isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? '🟢 Open' : '🔴 Closed'}
          </span>
          <button
            type="button"
            disabled={updatingStatus}
            onClick={async () => {
              setUpdatingStatus(true);
              try {
                const nextOpen = !isOpen;
                await api.put('/canteen/status', { isOpen: nextOpen });
                await refreshCanteen();
                toast.success(nextOpen ? 'Canteen opened' : 'Canteen closed');
                if (!nextOpen) setShowDailyInvoice(true);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to update status');
              } finally {
                setUpdatingStatus(false);
              }
            }}
            className="rounded-xl bg-dark px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
          </button>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-surface p-4">
            <span className="text-xl">{card.icon}</span>
            <p className="mt-2 text-2xl font-extrabold text-dark">{card.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              {card.label}
            </p>
            {card.sub && <p className="mt-1 text-[10px] text-green-600">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Link
          to="/admin/menu"
          className="rounded-2xl border border-primary/30 bg-[#FFF3E0] p-5 transition hover:shadow-md"
        >
          <h2 className="font-bold text-primary">Manage Menu</h2>
          <p className="mt-1 text-sm text-neutral-600">Add items with descriptions & images</p>
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-2xl border border-cream bg-white p-5 transition hover:shadow-md"
        >
          <h2 className="font-bold text-dark">Live Orders Queue</h2>
          <p className="mt-1 text-sm text-neutral-600">Update status in real time</p>
        </Link>
      </div>

      {stats?.mostOrdered?.length > 0 && (
        <div className="rounded-2xl bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-dark">Top Items</h2>
          <ul className="space-y-3">
            {stats.mostOrdered.map((item) => (
              <li key={item.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 font-semibold text-neutral-700">{item.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-bold text-primary">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDailyInvoice && (
        <DailyInvoiceModal 
          date={null} 
          onClose={() => {
            setShowDailyInvoice(false);
            fetchStats(); // Refresh stats after invoice is printed
          }} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
