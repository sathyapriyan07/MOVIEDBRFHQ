
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface FooterProps {
  isLoggedIn: boolean;
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Footer: React.FC<FooterProps> = ({ isLoggedIn, user, onLoginClick, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('sathyapriyan');

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[56px] bg-gray-900 border-t border-white/5 px-4 flex items-center justify-between z-40 safe-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {/* Left: Branding */}
      <div className="flex flex-col">
        <span className="text-white text-[10px] font-black uppercase tracking-tighter">© Rarefindshq</span>
        <span className="text-gray-500 text-[8px] font-medium uppercase tracking-widest opacity-60">Cinema Destination</span>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest">
        <Link 
          to="/watchlist" 
          className={`${isActive('/watchlist') ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`}
        >
          Watchlist
        </Link>
        <Link 
          to="/" 
          className={`${isActive('/') ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors`}
        >
          Browse
        </Link>
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className={`text-gray-600 hover:text-white transition-colors border-l border-white/10 pl-4`}
          >
            Admin
          </Link>
        )}

        {isLoggedIn ? (
          <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors">
            Logout
          </button>
        ) : (
          <button onClick={onLoginClick} className="text-gray-400 hover:text-white transition-colors">
            Login
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
