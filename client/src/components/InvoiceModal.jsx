import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const InvoiceModal = ({ orderId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [upi, setUpi] = useState(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${orderId}/invoice`);
        setInvoice(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load invoice');
        onClose?.();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderId, onClose]);

  useEffect(() => {
    const run = async () => {
      if (!orderId) return;
      try {
        const { data } = await api.get(`/orders/${orderId}/upi`);
        setUpi(data);
      } catch {
        setUpi(null);
      }
    };
    run();
  }, [orderId]);

  const invoiceDate = useMemo(() => {
    if (!invoice?.createdAt) return '';
    return new Date(invoice.createdAt).toLocaleString();
  }, [invoice]);

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-cream px-4 py-3">
          <div>
            <p className="text-sm font-extrabold text-dark">🧾 Invoice</p>
            {invoice?.invoiceNumber && (
              <p className="text-[10px] text-neutral-400">{invoice.invoiceNumber}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
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
          ) : invoice ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-surface p-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">Date</span>
                  <span className="font-semibold text-dark">{invoiceDate}</span>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="text-neutral-500">Token</span>
                  <span className="font-semibold text-dark">#{invoice.tokenNumber}</span>
                </div>
                <div className="mt-2 flex justify-between gap-3">
                  <span className="text-neutral-500">Payment</span>
                  <span className="font-semibold text-dark">
                    {invoice.paymentMethod} · {invoice.paymentStatus}
                  </span>
                </div>
                {upi?.qrCodeUrl && invoice.paymentStatus !== 'Paid' && (
                  <div className="mt-3 space-y-2 rounded-lg border border-cream bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-600">
                        📱 Scan to Pay via UPI
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQr(!showQr)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        {showQr ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {showQr && (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={upi.qrCodeUrl}
                          alt="UPI Payment QR Code"
                          className="h-48 w-48 rounded-lg border border-cream p-1"
                        />
                        <p className="text-center text-[9px] text-neutral-500">
                          Amount: ₹{upi.amount}
                        </p>
                      </div>
                    )}
                    <a
                      href={upi.upiUri}
                      className="block rounded-lg bg-primary px-3 py-2 text-center text-[10px] font-extrabold text-white"
                    >
                      Pay Now via UPI
                    </a>
                  </div>
                )}
              </div>

              {invoice.instructions && (
                <div className="rounded-xl border border-cream bg-white p-3 text-xs">
                  <p className="font-bold text-dark">📝 Instructions</p>
                  <p className="mt-1 text-neutral-600">{invoice.instructions}</p>
                </div>
              )}

              <div className="rounded-xl border border-cream bg-white p-3 text-xs">
                <p className="mb-2 font-bold text-dark">Items</p>
                <ul className="space-y-1.5">
                  {invoice.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between text-neutral-700">
                      <span className="truncate">
                        {i.name} × {i.quantity}
                      </span>
                      <span className="font-semibold">₹{i.lineTotal}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-cream pt-2 text-sm font-extrabold">
                  <span className="text-neutral-600">Total</span>
                  <span className="text-primary">₹{invoice.total}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
