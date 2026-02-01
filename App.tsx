
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import TitleDetail from './pages/TitleDetail';
import PeopleDetail from './pages/PeopleDetail';
import AdminDashboard from './pages/AdminDashboard';
import Watchlist from './pages/Watchlist';
import AuthModal from './components/AuthModal';
import { supabase, hasValidConfig } from './lib/supabase';

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!hasValidConfig) return;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Initial session fetch failed:', error);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    if (hasValidConfig) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-black flex flex-col relative overflow-x-hidden selection:bg-white selection:text-black">
        <Header 
          isLoggedIn={!!user} 
          user={user}
          onAuthClick={() => openAuth('login')} 
          onLogout={handleLogout}
        />
        
        <main className="flex-grow pb-24">
          {!hasValidConfig && (
            <div className="bg-white/5 border-b border-white/5 px-4 py-1.5 text-[9px] text-gray-500 font-black text-center uppercase tracking-[0.3em] backdrop-blur-sm sticky top-[56px] z-40">
              Operational Status: Offline • Data Synced to Terminal Cache
            </div>
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/title/:id" element={<TitleDetail />} />
            <Route path="/person/:id" element={<PeopleDetail />} />
            <Route path="/admin/*" element={<AdminDashboard user={user} />} />
            <Route path="/movies" element={<Home filter="movie" />} />
            <Route path="/series" element={<Home filter="series" />} />
            <Route path="/watchlist" element={<Watchlist user={user} />} />
          </Routes>
        </main>

        <Footer 
          isLoggedIn={!!user}
          user={user}
          onLoginClick={() => openAuth('login')} 
          onLogout={handleLogout}
        />

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          mode={authMode}
          setMode={setAuthMode}
        />
      </div>
    </HashRouter>
  );
};

export default App;
