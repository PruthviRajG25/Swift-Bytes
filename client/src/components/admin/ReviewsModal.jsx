import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const ReviewsModal = ({ onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/stats/reviews');
        setReviews(data || []);
      } catch {
        toast.error('Failed to load reviews');
        onClose?.();
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col max-h-[85vh]">
        <header className="flex items-center justify-between border-b border-cream px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-dark flex items-center gap-2">
              ⭐ Customer Reviews
            </h2>
            <p className="text-[10px] text-neutral-400">All ratings and feedback from canteen customers</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-dark hover:bg-neutral-800 px-4 py-2 text-xs font-bold text-white transition"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-3xl">✨</span>
              <p className="mt-3 text-sm text-neutral-500 font-semibold">No reviews submitted yet.</p>
            </div>
          ) : (
            <ul className="space-y-4 divide-y divide-cream/60">
              {reviews.map((rev) => (
                <li
                  key={rev.orderId}
                  className={`pt-4 first:pt-0 border-cream/60`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold text-dark">
                        {rev.customer} <span className="font-normal text-neutral-400">· Token #{rev.tokenNumber}</span>
                      </p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">
                        {new Date(rev.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex text-sm text-primary font-bold">
                      {'★'.repeat(rev.rating)}
                      <span className="text-neutral-200">{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600 bg-surface rounded-xl p-3 leading-relaxed border border-cream/30">
                    {rev.comment || <span className="italic text-neutral-400">No comment provided</span>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
