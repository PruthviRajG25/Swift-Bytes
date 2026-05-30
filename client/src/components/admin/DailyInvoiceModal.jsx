import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const DailyInvoiceModal = ({ date, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const qs = date ? `?date=${encodeURIComponent(date)}` : '';
        const res = await api.get(`/stats/daily-invoice${qs}`);
        setData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load daily invoice');
        onClose?.();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [date, onClose]);

  const titleDate = useMemo(() => {
    if (!data?.date) return '';
    return new Date(`${data.date}T00:00:00`).toLocaleDateString();
  }, [data]);

  const handlePrint = async () => {
    try {
      // Mark invoice as printed
      await api.post('/canteen/invoice-printed');
      toast.success('Invoice marked as printed');
      window.print();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark invoice as printed');
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-cream px-4 py-3">
          <div>
            <p className="text-sm font-extrabold text-dark">📒 Daily Earnings</p>
            {titleDate && <p className="text-[10px] text-neutral-400">{titleDate}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border border-cream px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-surface"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-dark px-3 py-1.5 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] font-bold text-neutral-400">Orders</p>
                  <p className="mt-1 text-xl font-extrabold text-dark">{data.totals.orderCount}</p>
                </div>
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] font-bold text-neutral-400">Gross</p>
                  <p className="mt-1 text-xl font-extrabold text-primary">₹{data.totals.gross}</p>
                </div>
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[10px] font-bold text-neutral-400">Split</p>
                  <p className="mt-1 text-xs font-bold text-dark">💵 ₹{data.totals.cash}</p>
                  <p className="mt-1 text-xs font-bold text-dark">📱 ₹{data.totals.upi}</p>
                </div>
              </div>

              {data.topItems?.length > 0 && (
                <div className="rounded-xl border border-cream bg-white p-3">
                  <p className="mb-2 text-xs font-bold text-dark">Top sold items</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.topItems.map((it) => (
                      <div
                        key={it.name}
                        className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs"
                      >
                        <span className="truncate font-semibold text-neutral-700">{it.name}</span>
                        <span className="font-extrabold text-primary">{it.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-cream bg-white p-3">
                <p className="mb-2 text-xs font-bold text-dark">Orders list</p>
                <div className="max-h-72 overflow-auto rounded-lg border border-cream">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface">
                      <tr className="text-[10px] font-bold text-neutral-500">
                        <th className="px-3 py-2">Token</th>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o._id} className="border-t border-cream">
                          <td className="px-3 py-2 font-bold text-dark">#{o.tokenNumber}</td>
                          <td className="px-3 py-2 text-neutral-600">
                            {new Date(o.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2 text-neutral-600">
                            {o.paymentMethod} · {o.paymentStatus}
                          </td>
                          <td className="px-3 py-2 font-extrabold text-primary">₹{o.total}</td>
                          <td className="px-3 py-2 text-neutral-600">{o.invoiceNumber || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DailyInvoiceModal;

