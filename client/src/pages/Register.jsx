import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CANTEEN } from '../config/canteen';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dietPreference, setDietPreference] = useState('all');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, dietPreference);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <img
            src="/swiftbites-logo.svg"
            alt="SwiftBites Bites"
            className="mx-auto h-14 w-14 rounded-2xl bg-surface p-1"
          />
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Sign up</h1>
          <p className="text-neutral-500">Create your account for {CANTEEN.shortName}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-700">Diet preference</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="diet"
                checked={dietPreference === 'all'}
                onChange={() => setDietPreference('all')}
                className="rounded"
              />
              All
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="diet"
                checked={dietPreference === 'veg'}
                onChange={() => setDietPreference('veg')}
                className="rounded"
              />
              Veg
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="diet"
                checked={dietPreference === 'nonveg'}
                onChange={() => setDietPreference('nonveg')}
                className="rounded"
              />
              Non-Veg
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-light py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Sign up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
