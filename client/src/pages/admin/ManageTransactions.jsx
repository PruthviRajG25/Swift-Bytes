import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // default to pending approvals
  const [approvingId, setApprovingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const url = filter === 'pending' ? '/wallet/admin/all?status=pending' : '/wallet/admin/all';
      const { data } = await api.get(url);
      setTransactions(data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTransactions();
  }, [filter]);

  const handleApprove = async (txnId) => {
    setApprovingId(txnId);
    try {
      const { data } = await api.post(`/wallet/approve/${txnId}`);
      toast.success(data.message || 'Payment approved!');
      // Update transaction status in state or reload
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payment');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-dark">Wallet Approvals</h1>
          <p className="text-sm text-neutral-500">Approve or reject customer wallet deposits</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <nav className="mb-6 flex gap-2 border-b border-cream pb-3">
        {['pending', 'all'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition capitalize ${
              filter === tab
                ? 'bg-dark text-white'
                : 'bg-white border border-cream text-neutral-600 hover:bg-surface'
            }`}
          >
            {tab} Recharge Requests
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-cream bg-white py-16 text-center shadow-sm">
          <span className="text-3xl">👛</span>
          <p className="mt-3 text-sm text-neutral-500">No transactions found matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <article
              key={txn._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-cream bg-white p-5 shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-dark">Ref: {txn.referenceId}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                      txn.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : txn.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-700">
                  Customer: <span className="font-bold text-dark">{txn.userId?.name || 'Unknown'}</span> ({txn.userId?.email || 'N/A'})
                </p>
                <p className="text-[10px] text-neutral-400">
                  Requested on {new Date(txn.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-cream sm:border-0 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-neutral-400">Recharge Amount</p>
                  <p className="text-lg font-black text-primary">₹{txn.amount.toFixed(2)}</p>
                </div>

                {txn.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(txn._id)}
                    disabled={approvingId === txn._id}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold px-4 py-2.5 text-xs transition duration-150 disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
                  >
                    {approvingId === txn._id ? <LoadingSpinner size="sm" /> : '✓ Approve'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTransactions;
