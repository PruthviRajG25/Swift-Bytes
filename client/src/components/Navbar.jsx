import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CANTEEN } from '../config/canteen';
import CanteenStatusPill from './CanteenStatusPill';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="flex shrink-0 items-center gap-2">
          <img
            src="/swiftbites-logo.svg"
            alt="SwiftBites Bites"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div>
            <span className="block text-base font-bold text-dark">SwiftBites Bites</span>
            <span className="hidden text-[10px] text-neutral-400 sm:block">{CANTEEN.shortName}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {user?.role === 'customer' && (
            <>
              <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-primary">
                Menu
              </Link>
              <Link to="/orders" className="text-sm font-medium text-neutral-600 hover:text-primary">
                My Orders
              </Link>
              <Link
                to="/cart"
                className="relative text-sm font-medium text-neutral-600 hover:text-primary"
              >
                Cart
                {itemCount > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin" className="text-sm font-medium text-neutral-600 hover:text-primary">
                Dashboard
              </Link>
              <Link
                to="/admin/alerts"
                className="text-sm font-medium text-neutral-600 hover:text-primary"
              >
                Alerts
              </Link>
              <Link to="/admin/menu" className="text-sm font-medium text-neutral-600 hover:text-primary">
                Menu
              </Link>
              <Link to="/admin/orders" className="text-sm font-medium text-neutral-600 hover:text-primary">
                Orders
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && <CanteenStatusPill />}
          {user ? (
            <>
              <span className="hidden text-sm text-neutral-500 sm:inline">Hi, {user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-cream px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-surface"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-primary to-primary-light px-5 py-2 text-sm font-bold text-white shadow-md shadow-primary/25"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
