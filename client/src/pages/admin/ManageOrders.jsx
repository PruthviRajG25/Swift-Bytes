import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import OrderCard from '../../components/OrderCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['Placed', 'Preparing', 'Ready', 'Completed'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const fetchOrders = async () => {
    try {
      const url =
        filter === 'active' ? '/orders?active=true' : filter ? `/orders?status=${filter}` : '/orders';
      const { data } = await api.get(url);
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const refresh = () => fetchOrders();
    socket.on('newOrder', refresh);
    socket.on('orderStatusChanged', refresh);

    return () => {
      socket.off('newOrder', refresh);
      socket.off('orderStatusChanged', refresh);
    };
  }, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const markPaid = async (orderId) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/payment`, { paymentStatus: 'Paid' });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      toast.success('Payment marked as Paid');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-dark">Live Orders Queue</h1>
      <p className="mb-6 text-sm text-neutral-500">Mark orders through to Completed when received</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {['active', 'Placed', 'Preparing', 'Ready', 'Completed', ''].map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-600 ring-1 ring-cream'
            }`}
          >
            {f === 'active' ? 'Active' : f || 'All'}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            return (
              <div key={order._id} className="space-y-3">
                <OrderCard order={order} showCustomer />
                {order.paymentMethod === 'UPI' && order.paymentStatus !== 'Paid' && (
                  <button
                    onClick={() => markPaid(order._id)}
                    className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-primary ring-1 ring-cream hover:bg-surface"
                  >
                    Mark UPI as Paid
                  </button>
                )}
                {nextStatus && (
                  <button
                    onClick={() => updateStatus(order._id, nextStatus)}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-2.5 text-sm font-bold text-white"
                  >
                    Mark as {nextStatus}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
