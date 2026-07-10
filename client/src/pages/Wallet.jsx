import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [refId, setRefId] = useState('');
  const [upiString, setUpiString] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchWalletData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      setBalance(userRes.data.walletBalance || 0);

      const txnsRes = await api.get('/wallet/my');
      setTransactions(txnsRes.data || []);
    } catch {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setGenerating(true);
    try {
      // Generate a client-side unique transaction reference ID
      const generatedRefId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Create a pending transaction on the server
      await api.post('/wallet/initiate', {
        amount: parsedAmount,
        referenceId: generatedRefId,
      });

      // 2. Generate the UPI string
      const { data } = await api.post('/wallet/upi', {
        amount: parsedAmount,
        referenceId: generatedRefId,
      });

      setRefId(generatedRefId);
      setUpiString(data.upiString);
      toast.success('UPI QR Code generated!');
      fetchWalletData(); // Refresh history
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setGenerating(false);
    }
  };

  const resetPayment = () => {
    setUpiString('');
    setRefId('');
    setAmount('');
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
      <h1 className="text-xl font-extrabold text-dark">My Wallet</h1>
      <p className="mb-6 text-sm text-neutral-500">Recharge your balance to place orders instantly</p>

      {/* Wallet Balance Card */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-light to-[#FFA15A] p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Available Balance</p>
            <h2 className="mt-1 font-display text-4xl font-extrabold">₹{balance.toFixed(2)}</h2>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchWalletData();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
            title="Refresh balance"
          >
            🔄
          </button>
        </div>
      </section>

      {/* Initiate Recharge Interface */}
      {!upiString ? (
        <section className="mb-6 rounded-2xl border border-cream bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-dark mb-4">Add Money to Wallet</h2>
          <form onSubmit={handleInitiatePayment} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-600">Recharge Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-cream bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                required
                min="10"
                max="10000"
              />
            </div>

            {/* Quick Select Buttons */}
            <div className="flex gap-2">
              {[100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 rounded-lg border border-cream py-2 text-xs font-bold text-neutral-700 hover:bg-primary/5 hover:border-primary hover:text-primary transition"
                >
                  +₹{val}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-dark py-3 text-sm font-bold text-white transition disabled:opacity-60"
            >
              {generating ? <LoadingSpinner size="sm" /> : 'Generate UPI QR Code'}
            </button>
          </form>
        </section>
      ) : (
        /* UPI Payment QR Code Section */
        <section className="mb-6 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 text-center shadow-sm">
          <h2 className="text-sm font-extrabold text-primary mb-1">Scan to Pay via UPI</h2>
          <p className="text-[10px] text-neutral-500 mb-4">Amount: <span className="font-bold text-dark">₹{Number(amount).toFixed(2)}</span></p>

          <div className="mx-auto my-4 flex justify-center rounded-xl bg-white p-4 shadow-md w-fit">
            <QRCodeCanvas value={upiString} size={180} />
          </div>

          <p className="mt-3 text-[11px] font-bold text-dark">Reference ID: {refId}</p>
          <p className="mt-1 text-[9px] text-neutral-500 px-4 leading-normal">
            Pay using GPay, PhonePe, Paytm or any other UPI app. The seeder merchant account is simulated.
            After paying, request Admin approval using your Reference ID.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                fetchWalletData();
                resetPayment();
              }}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition"
            >
              I Have Paid
            </button>
            <button
              onClick={resetPayment}
              className="rounded-xl border border-cream bg-white px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-surface transition"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Transaction History Section */}
      <section className="rounded-2xl border border-cream bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-dark mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-400">No transactions recorded yet.</p>
        ) : (
          <ul className="space-y-3 divide-y divide-cream/60">
            {transactions.map((txn, idx) => (
              <li key={txn._id} className={`flex items-center justify-between text-xs pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                <div>
                  <p className="font-semibold text-dark truncate max-w-[180px]">Ref: {txn.referenceId}</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">{new Date(txn.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[8px] font-extrabold ${
                      txn.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : txn.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {txn.status.toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Wallet;
