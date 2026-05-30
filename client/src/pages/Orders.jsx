import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CANTEEN } from '../config/canteen';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('joinUser', user._id);

    const handleUpdate = (updatedOrder) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === updatedOrder._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedOrder;
          if (updatedOrder.status === 'Completed') {
            toast.success(`Order #${updatedOrder.tokenNumber} received — leave a review!`);
          } else {
            toast.success(`Order #${updatedOrder.tokenNumber} is now ${updatedOrder.status}`);
          }
          return next;
        }
        return [updatedOrder, ...prev];
      });
    };

    socket.on('orderUpdate', handleUpdate);
    socket.on('orderStatusChanged', handleUpdate);
    socket.on('invoiceGenerated', (payload) => {
      if (payload?.invoiceNumber) {
        toast.success(`Invoice generated: ${payload.invoiceNumber}`);
      }
    });

    return () => {
      socket.off('orderUpdate', handleUpdate);
      socket.off('orderStatusChanged', handleUpdate);
      socket.off('invoiceGenerated');
    };
  }, [user]);

  const handleReviewSubmitted = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6 pb-28">
      <h1 className="text-xl font-extrabold text-dark">My Orders</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Track orders from {CANTEEN.shortName} · review after pickup
      </p>
      {orders.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">No orders yet. Place your first order!</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onReviewSubmitted={handleReviewSubmitted}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;
