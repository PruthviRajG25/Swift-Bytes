import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="flex shrink-0 items-center gap-3">
          <img src="/swiftbites-logo.svg" alt="SwiftBites" className="h-9 w-9 rounded-lg object-cover" />
          <span className="block text-base font-bold text-dark">SwiftBites</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {user?.role === 'customer' && (
            <>
              <Link to="/" className="text-sm font-medium text-neutral-700 hover:text-primary">
                Menu
              </Link>
              <Link to="/cart" className="relative text-sm font-medium text-neutral-700 hover:text-primary">
                Cart
                {itemCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link to="/wallet" className="text-sm font-medium text-neutral-700 hover:text-primary">
                Wallet
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin" className="text-sm font-medium text-neutral-700 hover:text-primary">
                Admin
              </Link>
              <Link to="/admin/transactions" className="text-sm font-medium text-neutral-700 hover:text-primary">
                Wallet Approvals
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && <CanteenStatusPill />}
          {user ? (
            <>
              <span className="hidden text-sm text-neutral-500 sm:inline">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-cream px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-surface"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md border border-primary px-3 py-1 text-sm font-semibold text-primary">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
