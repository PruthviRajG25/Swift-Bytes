import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ orderId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/${orderId}/review`, { rating, comment });
      toast.success('Thanks for your review!');
      onSubmitted?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-primary/20 bg-[#FFF3E0] p-4">
      <p className="mb-2 text-sm font-bold text-dark">Rate your experience</p>
      <p className="mb-3 text-xs text-neutral-500">Order received — how was your food?</p>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition ${star <= rating ? 'text-amber-400' : 'text-neutral-300'}`}
            aria-label={`${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us what you liked (optional)"
        rows={2}
        className="mb-3 w-full resize-none rounded-lg border border-cream bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
