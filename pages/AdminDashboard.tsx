
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { supabase, hasValidConfig } from '../lib/supabase';

const Layout: React.FC<{ title: string; children: React.ReactNode; user: any }> = ({ title, children, user }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-4 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col space-y-4 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all flex items-center group"
        >
          <span className="mr-2 text-sm group-hover:-translate-x-1 transition-transform">←</span> Operational Terminal
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">{title}</h1>
      </div>
      <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/5 shadow-2xl backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

// --- SUB-MODULE: TITLES ---
const TitlesModule: React.FC = () => {
  const [titles, setTitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', year: 2024, type: 'movie', poster: '', overview: '' });

  useEffect(() => { fetchTitles(); }, []);
  const fetchTitles = async () => {
    setLoading(true);
    const { data } = await supabase.from('titles').select('*').order('created_at', { ascending: false });
    setTitles(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('titles').insert([formData]);
    setFormData({ title: '', year: 2024, type: 'movie', poster: '', overview: '' });
    setShowForm(false);
    fetchTitles();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Archive Records</h3>
        <button onClick={() => setShowForm(!showForm)} className="bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg">
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-top-2">
          <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black h-11 rounded-lg px-4 text-xs font-bold border border-white/5 focus:border-white/20 outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="bg-black h-11 rounded-lg px-4 text-xs font-bold border border-white/5 outline-none" />
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="bg-black h-11 rounded-lg px-4 text-xs font-bold border border-white/5 outline-none">
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
          </div>
          <input placeholder="Poster URL" value={formData.poster} onChange={e => setFormData({...formData, poster: e.target.value})} className="w-full bg-black h-11 rounded-lg px-4 text-xs font-bold border border-white/5 outline-none" />
          <button type="submit" className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Commit to Archive</button>
        </form>
      )}

      <div className="space-y-2">
        {titles.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center space-x-3">
              <img src={t.poster} className="w-8 h-12 object-cover rounded bg-gray-800" />
              <div>
                <p className="text-[11px] font-black">{t.title}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{t.year} • {t.type}</p>
              </div>
            </div>
            <button onClick={async () => { await supabase.from('titles').delete().eq('id', t.id); fetchTitles(); }} className="text-red-900/40 hover:text-red-500 text-lg px-2">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-MODULE: GENRES ---
const GenresModule: React.FC = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => { fetchGenres(); }, []);
  const fetchGenres = async () => {
    const { data } = await supabase.from('genres').select('*').order('name');
    setGenres(data || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from('genres').insert([{ name }]);
    setName('');
    fetchGenres();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Genre Name" className="flex-1 bg-black h-11 rounded-xl px-4 text-xs font-bold border border-white/5 outline-none" />
        <button type="submit" className="px-6 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl">Add</button>
      </form>
      <div className="grid grid-cols-2 gap-2">
        {genres.map(g => (
          <div key={g.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest">{g.name}</span>
            <button onClick={async () => { await supabase.from('genres').delete().eq('id', g.id); fetchGenres(); }} className="text-red-900/40">×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-MODULE: IMPORT ---
const ImportModule: React.FC = () => {
  const DEFAULT_TMDB_KEY = '4137fa1e7ec785478b6ae1066ca2d224';
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem('tmdb_api_key') || DEFAULT_TMDB_KEY);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('tmdb_api_key', tmdbKey); }, [tmdbKey]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbKey) return;
    setLoading(true);
    try {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results?.filter((r: any) => ['movie', 'tv', 'person'].includes(r.media_type)) || []);
    } catch (err) { setMessage('Search failed'); }
    finally { setLoading(false); }
  };

  const handleImport = async (item: any) => {
    setMessage(`Syncing ${item.title || item.name}...`);
    try {
      const endpoint = item.media_type === 'movie' ? 'movie' : 'tv';
      const url = `https://api.themoviedb.org/3/${endpoint}/${item.id}?api_key=${tmdbKey}`;
      const res = await fetch(url);
      const d = await res.json();
      
      await supabase.from('titles').upsert({
        title: d.title || d.name,
        year: parseInt((d.release_date || d.first_air_date || '').split('-')[0]) || 0,
        type: item.media_type === 'movie' ? 'movie' : 'series',
        poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
        overview: d.overview,
        published: true
      }, { onConflict: 'title' });
      
      setMessage(`Success: ${item.title || item.name} synced.`);
    } catch (err) { setMessage('Sync failed'); }
    finally { setTimeout(() => setMessage(null), 3000); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-4 rounded-xl space-y-3 border border-white/5">
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">API Configuration</p>
        <input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} className="w-full bg-black h-10 rounded-lg px-4 text-xs font-bold border border-white/5" placeholder="TMDB Key" />
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-black h-12 rounded-xl px-4 text-xs font-bold border border-white/5" placeholder="Search Cloud Archives..." />
        <button type="submit" className="px-6 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl">{loading ? '...' : 'Search'}</button>
      </form>
      {message && <div className="p-3 bg-white/5 rounded-xl text-[9px] font-black uppercase text-center text-gray-400">{message}</div>}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
        {results.map(r => (
          <div key={r.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 group">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img src={r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : 'https://picsum.photos/92/138'} className="w-8 h-12 object-cover rounded flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[11px] font-black truncate">{r.title || r.name}</p>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{r.media_type} • {r.release_date?.split('-')[0] || r.first_air_date?.split('-')[0]}</p>
              </div>
            </div>
            <button onClick={() => handleImport(r)} className="bg-white text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Sync</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN ADMIN ROUTER ---
const AdminHome: React.FC<{ user: any }> = ({ user }) => {
  const modules = [
    { name: 'Titles', path: 'titles', icon: '🎬' },
    { name: 'Genres', path: 'genres', icon: '🏷️' },
    { name: 'Home Sections', path: 'home-sections', icon: '🏠' },
    { name: 'People', path: 'people', icon: '👤' },
    { name: 'Import', path: 'import', icon: '📥' }
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col space-y-1 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Command Center</h1>
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">System Administration Portal</p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-white/5 shadow-xl">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Authorized Identity</h2>
        <div className="bg-gray-900 rounded-xl p-4 border border-white/5 flex items-center justify-between overflow-hidden">
          <div className="truncate pr-4">
            <p className="text-[13px] font-bold text-white truncate">{user?.email || 'Admin Agent'}</p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Terminal Access Level 4</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {modules.map(mod => (
          <Link 
            key={mod.name} to={`/admin/${mod.path}`}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-2xl h-[56px] flex items-center px-5 justify-between transition-all group active:scale-[0.98] border border-white/5"
          >
            <div className="flex items-center space-x-4">
              <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">{mod.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{mod.name}</span>
            </div>
            <span className="text-gray-600 group-hover:text-white transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ user: any }> = ({ user }) => {
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('sathyapriyan') || user?.email?.includes('test');
  
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-1000">
        <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mb-8 opacity-20 shadow-2xl">🔐</div>
        <h1 className="text-xl font-black uppercase tracking-tighter mb-2 text-white/90">Unauthorized Terminal</h1>
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Identity verification failed.</p>
        <Link to="/" className="mt-10 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Return Home</Link>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AdminHome user={user} />} />
      <Route path="/titles" element={<Layout title="Archive Library" user={user}><TitlesModule /></Layout>} />
      <Route path="/genres" element={<Layout title="Genre Architecture" user={user}><GenresModule /></Layout>} />
      <Route path="/import" element={<Layout title="Cloud Sync" user={user}><ImportModule /></Layout>} />
      <Route path="/people" element={<Layout title="Personnel Archive" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Personnel Module (TBA)</div></Layout>} />
      <Route path="/home-sections" element={<Layout title="UX Configuration" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Sections Module (TBA)</div></Layout>} />
    </Routes>
  );
};

export default AdminDashboard;
