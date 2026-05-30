import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const playBeep = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 180);
  } catch {
    // ignore sound errors
  }
};

const AdminAlerts = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadIds, setUnreadIds] = useState(() => new Set());
  const firstLoadRef = useRef(true);

  const fetchActive = async () => {
    try {
      const { data } = await api.get('/orders?active=true');
      setOrders(data || []);
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
        setUnreadIds(new Set());
      }
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      setUnreadIds((prev) => new Set(prev).add(String(order?._id)));
      toast.success('🛎️ New order received');
      if (soundEnabled) playBeep();
    };

    socket.on('newOrder', onNewOrder);
    return () => socket.off('newOrder', onNewOrder);
  }, [soundEnabled]);

  const unreadCount = unreadIds.size;

  const sorted = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return copy;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">🔔 Alerts</h1>
          <p className="text-sm text-neutral-500">
            Live new-order notifications {unreadCount > 0 ? `· ${unreadCount} unread` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="rounded-xl border border-cream bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-surface"
          >
            {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
          <button
            type="button"
            onClick={() => setUnreadIds(new Set())}
            className="rounded-xl bg-dark px-4 py-2 text-sm font-bold text-white"
          >
            Mark all read
          </button>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">No active orders right now.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((o) => {
            const isUnread = unreadIds.has(String(o._id));
            return (
              <button
                key={o._id}
                type="button"
                onClick={() => {
                  // Mark as read = accept order (Placed -> Preparing)
                  setUnreadIds((prev) => {
                    const next = new Set(prev);
                    next.delete(String(o._id));
                    return next;
                  });
                  if (o.status === 'Placed') {
                    api
                      .put(`/orders/${o._id}/status`, { status: 'Preparing' })
                      .then(({ data }) => {
                        setOrders((prev) => prev.map((x) => (x._id === o._id ? data : x)));
                        toast.success(`Order #${data.tokenNumber} accepted`);
                      })
                      .catch((err) => {
                        toast.error(err.response?.data?.message || 'Failed to accept order');
                      });
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isUnread ? 'border-primary bg-[#FFF7ED]' : 'border-cream bg-white'
                } hover:shadow-sm`}
                title="Click to accept order"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-dark">
                      Token #{o.tokenNumber}{' '}
                      {isUnread && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-white">
                          NEW
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-neutral-700">
                      {o.items?.map((it) => `${it.name}×${it.quantity}`).join(', ')}
                    </p>
                    {o.instructions && (
                      <p className="mt-1 text-[11px] text-neutral-600">📝 {o.instructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-600">{o.paymentMethod}</p>
                    <p className="mt-1 text-sm font-extrabold text-primary">₹{o.totalPrice}</p>
                    <p className="mt-1 text-[10px] font-bold text-neutral-500">{o.status}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default AdminAlerts;
