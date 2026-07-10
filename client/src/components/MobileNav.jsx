import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { itemCount } = useCart();

  if (!user || user.role === 'admin') return null;

  const linkClass = (path) =>
    `flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
      pathname === path ? 'text-primary' : 'text-neutral-400'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream bg-white px-4 py-2 md:hidden">
      <div className="flex justify-around">
        <Link to="/" className={linkClass('/')}>
          <span className="text-lg">🏠</span>
          Home
        </Link>
        <Link to="/cart" className={`relative ${linkClass('/cart')}`}>
          <span className="text-lg">🛒</span>
          Cart
          {itemCount > 0 && (
            <span className="absolute -right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-white">
              {itemCount}
            </span>
          )}
        </Link>
        <Link to="/orders" className={linkClass('/orders')}>
          <span className="text-lg">📦</span>
          Orders
        </Link>
        <Link to="/wallet" className={linkClass('/wallet')}>
          <span className="text-lg">👛</span>
          Wallet
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;
