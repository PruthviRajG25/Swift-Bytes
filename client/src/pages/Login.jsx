import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CANTEEN } from '../config/canteen';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <article className="w-full max-w-md overflow-hidden rounded-2xl border border-cream bg-white shadow-lg">
        <header className="bg-gradient-to-r from-primary to-primary-light px-8 py-6 text-center text-white">
          <img
            src="/swiftbites-logo.svg"
            alt="SwiftBites Bites"
            className="mx-auto h-14 w-14 rounded-2xl bg-white/90 p-1"
          />
          <h1 className="mt-2 text-2xl font-bold">SwiftBites Bites</h1>
          <p className="text-sm text-white/85">{CANTEEN.name}</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 p-8">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-cream px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="you@college.edu"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-cream px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Log in'}
          </button>
        </form>
        <p className="pb-4 text-center text-sm text-neutral-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
        {/* <aside className="mx-8 mb-6 rounded-xl bg-surface p-3 text-xs text-neutral-500">
          <p className="font-semibold text-dark">Demo (after seed):</p>
          <p>Admin: admin@canteen.com / admin123</p>
          <p>Student: student@canteen.com / student123</p>
        </aside> */}
      </article>
    </section>
  );
};

export default Login;
