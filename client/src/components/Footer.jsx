import { Link } from 'react-router-dom';
import { CANTEEN } from '../config/canteen';

const Footer = () => (
  <footer className="mt-auto hidden border-t border-cream bg-white md:block">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-neutral-500">
        <span>© SwiftBites Bites · {CANTEEN.name}</span>
        <span className="hidden sm:inline">·</span>
        <Link to="/privacy" className="font-medium text-neutral-600 hover:text-primary">
          Privacy
        </Link>
        <span className="hidden sm:inline">·</span>
        <Link to="/terms" className="font-medium text-neutral-600 hover:text-primary">
          Terms
        </Link>
        <span className="hidden sm:inline">·</span>
        <span>Made with ❤️ for our campus</span>
      </div>
    </div>
  </footer>
);

export default Footer;
