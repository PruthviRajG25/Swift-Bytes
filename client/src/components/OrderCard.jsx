import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import { CANTEEN } from '../config/canteen';
import InvoiceModal from './InvoiceModal';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'Placed', label: 'Order Confirmed', sub: 'Canteen accepted your order' },
  { key: 'Preparing', label: 'Being Prepared', sub: 'Chef is cooking your food' },
  { key: 'Ready', label: 'Ready for Pickup', sub: `Collect from ${CANTEEN.counter}` },
  { key: 'Completed', label: 'Received', sub: 'Bon appétit!' },
];

const statusBadge = {
  Placed: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-[#FFF3E0] text-[#E65100]',
  Ready: 'bg-green-100 text-green-800',
  Completed: 'bg-neutral-100 text-neutral-600',
  Cancelled: 'bg-red-100 text-red-800',
};

const stepIndex = (status) => STATUS_STEPS.findIndex((s) => s.key === status);

const OrderCard = ({ order, showCustomer = false, onReviewSubmitted }) => {
  const [localOrder, setLocalOrder] = useState(order);
  const [showInvoice, setShowInvoice] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  const current = stepIndex(localOrder.status);
  const showTracking = localOrder.status !== 'Completed' && localOrder.status !== 'Cancelled';
  const canReview =
    !showCustomer && localOrder.status === 'Completed' && !localOrder.review?.rating;

  const handleReview = (updated) => {
    setLocalOrder(updated);
    onReviewSubmitted?.(updated);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${localOrder._id}/cancel`);
      setLocalOrder(data);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-cream bg-white shadow-sm">
      <header className="bg-dark px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">
              {showTracking ? 'Live Tracking' : 'Order'} #{localOrder.tokenNumber}
            </p>
            <p className="text-[10px] text-white/60">
              {new Date(localOrder.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`rounded-lg px-2 py-1 text-[10px] font-bold ${statusBadge[localOrder.status]}`}
          >
            {localOrder.status}
          </span>
        </div>
        {showCustomer && localOrder.userId?.name && (
          <p className="mt-1 text-xs text-white/70">{localOrder.userId.name}</p>
        )}
        {!showCustomer && localOrder.invoiceNumber && (
          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-white/15"
          >
            🧾 View Invoice ({localOrder.invoiceNumber})
          </button>
        )}
      </header>

      {showTracking && (
        <section className="border-b border-cream bg-gradient-to-br from-green-50 to-green-100 px-4 py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
            <span className="text-2xl" aria-hidden>
              🍴
            </span>
          </div>
          <p className="mt-2 text-center text-xs text-neutral-600">{CANTEEN.name}</p>
        </section>
      )}

      <section className="p-4">
        {showTracking && (
          <ol className="mb-4 list-none space-y-0 p-0">
            {STATUS_STEPS.map((step, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={step.key} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                        done
                          ? 'bg-primary text-white'
                          : active
                            ? 'border-2 border-primary-pale bg-primary-light text-white'
                            : 'bg-cream text-neutral-300'
                      }`}
                    >
                      {done ? '✓' : active ? '⋯' : '○'}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <span
                        className={`my-0.5 block h-3 w-0.5 ${done ? 'bg-primary' : 'bg-cream'}`}
                      />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-bold text-dark">{step.label}</p>
                    <p className="text-[10px] text-neutral-400">{step.sub}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mb-2 text-xs font-bold text-dark">Your Order</p>
        <ul className="mb-3 space-y-1.5">
          {localOrder.items.map((item, i) => (
            <li key={i} className="flex justify-between text-xs text-neutral-600">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold">₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-cream pt-3">
          <span className="text-xs text-neutral-500">Total</span>
          <span className="font-bold text-primary">₹{localOrder.totalPrice}</span>
        </div>

        {localOrder.status === 'Cancelled' && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center border border-red-100/60 animate-pulse">
            <p className="text-xs font-bold text-red-700">❌ Order Cancelled</p>
            <p className="text-[10px] text-red-600/80 mt-0.5">
              This order has been cancelled and refunded if paid via Wallet.
            </p>
          </div>
        )}

        {localOrder.status === 'Placed' && !showCustomer && (
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="mt-4 w-full rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-100 hover:text-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 shadow-sm"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        {localOrder.review?.rating && (
          <div className="mt-3 rounded-lg bg-surface p-3">
            <p className="text-xs font-bold text-dark">
              Your review: {'★'.repeat(localOrder.review.rating)}
              <span className="text-neutral-300">
                {'☆'.repeat(5 - localOrder.review.rating)}
              </span>
            </p>
            {localOrder.review.comment && (
              <p className="mt-1 text-[11px] text-neutral-500">{localOrder.review.comment}</p>
            )}
          </div>
        )}

        {canReview && <ReviewForm orderId={localOrder._id} onSubmitted={handleReview} />}
      </section>

      {showInvoice && (
        <InvoiceModal orderId={localOrder._id} onClose={() => setShowInvoice(false)} />
      )}
    </article>
  );
};

export default OrderCard;

