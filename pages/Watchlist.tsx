
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, hasValidConfig } from '../lib/supabase';
import PosterCard from '../components/PosterCard';

const Watchlist: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      if (!user || !hasValidConfig) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('watchlist')
          .select('*, title:titles(*)')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setItems(data?.map(d => d.title).filter(Boolean) || []);
      } catch (err) {
        console.error('Error fetching watchlist:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white px-4 pt-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-white/5 opacity-20">🔒</div>
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-tighter">Vault Restricted</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase max-w-[200px] leading-relaxed">Identity verification required to access your collection.</p>
        </div>
        <button onClick={() => navigate('/')} className="text-white text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Return Home</button>
      </div>
    );
  }

  if (!hasValidConfig) {
    return (
      <div className="min-h-screen bg-black text-white px-4 pt-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-white/5 opacity-20">📡</div>
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-tighter">Terminal Offline</h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase max-w-[200px] leading-relaxed">Watchlist persistence requires a live database connection.</p>
        </div>
        <button onClick={() => navigate('/')} className="text-white text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all flex items-center group"
        >
          <span className="mr-2 text-lg font-light translate-y-[-1px] group-hover:-translate-x-1 transition-transform">&lt;</span> Back
        </button>
      </div>

      <div className="space-y-2 mb-10">
        <h1 className="text-2xl font-black tracking-tighter uppercase">Your Watchlist</h1>
        <p className="text-[11px] text-gray-500 font-black tracking-widest uppercase">Titles you've saved to watch later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 animate-pulse">
           {[1,2,3].map(i => <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg"></div>)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {items.map((item) => (
            <PosterCard key={item.id} title={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-white/5">
            <span className="text-2xl opacity-20">★</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-200 leading-relaxed">Your watchlist is currently empty.</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Explore titles and add them to your list</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
          >
            Browse Titles
          </button>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
