
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  user: any;
  onAuthClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, user, onAuthClick, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-50 h-[56px] w-full bg-black/80 backdrop-blur-md flex items-center px-4 justify-between border-b border-white/5 transition-all">
      {/* Left: Logo */}
      <Link to="/" className="text-white font-black text-sm tracking-tighter shrink-0">
        Rarefindshq
      </Link>

      {/* Center: Navigation */}
      <nav className="flex items-center space-x-4 text-[11px] font-black uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
        <Link 
          to="/movies" 
          className={`${isActive('/movies') ? 'text-white' : 'text-gray-500'} hover:text-white transition-colors`}
        >
          Movies
        </Link>
        <span className="text-gray-800 font-light">|</span>
        <Link 
          to="/series" 
          className={`${isActive('/series') ? 'text-white' : 'text-gray-500'} hover:text-white transition-colors`}
        >
          Series
        </Link>
      </nav>

      {/* Right: Profile Circle */}
      <div className="flex items-center">
        {isLoggedIn ? (
          <button 
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[11px] font-black text-white hover:bg-gray-700 transition-all active:scale-90"
          >
            {initial}
          </button>
        ) : (
          <button 
            onClick={onAuthClick}
            className="w-8 h-8 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-[11px] font-black text-gray-500 hover:text-white transition-all"
          >
            ?
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
