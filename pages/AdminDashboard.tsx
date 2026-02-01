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
          className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-all flex items-center"
        >
          <span className="mr-2 text-sm">←</span> Operational Terminal
        </button>
        <h1 className="text-xl font-black uppercase tracking-tighter">{title}</h1>
      </div>
      <div className="bg-gray-900 rounded-2xl p-4 border border-white/5 shadow-2xl">
        {children}
      </div>
    </div>
  );
};

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
        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Authorized Agent Identity</h2>
        <div className="bg-gray-900 rounded-xl p-4 border border-white/5 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-[13px] font-bold truncate text-white">{user?.email}</p>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Level 4 Access Granted</p>
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

const ImportModule: React.FC<{ user: any }> = ({ user }) => {
  const DEFAULT_TMDB_KEY = '4137fa1e7ec785478b6ae1066ca2d224';
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem('tmdb_api_key') || DEFAULT_TMDB_KEY);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('tmdb_api_key', tmdbKey); }, [tmdbKey]);

  const tmdbFetch = async (path: string, params: Record<string, string> = {}) => {
    const query = new URLSearchParams({ ...params, api_key: tmdbKey }).toString();
    const url = `https://api.themoviedb.org/3/${path}?${query}`;
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('API request failed');
      return await res.json();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') throw new Error('Blocked by Ad-Blocker or DNS');
      throw err;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbKey) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await tmdbFetch('search/multi', { query: searchQuery, include_adult: 'false' });
      setResults(data.results?.filter((r: any) => ['movie', 'tv', 'person'].includes(r.media_type)) || []);
    } catch (err: any) { setMessage(`Error: ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleImport = async (item: any) => {
    if (!hasValidConfig) return;
    setImportingId(item.id);
    setMessage(`Syncing ${item.title || item.name}...`);
    try {
      if (item.media_type === 'person') {
        const p = await tmdbFetch(`person/${item.id}`);
        await supabase.from('people').upsert({
          name: p.name,
          biography: p.biography,
          avatar: p.profile_path ? `https://image.tmdb.org/t/p/w500${p.profile_path}` : null
        }, { onConflict: 'name' });
        setMessage(`Success: Synced Profile ${p.name}`);
      } else {
        const endpoint = item.media_type === 'movie' ? 'movie' : 'tv';
        const d = await tmdbFetch(`${endpoint}/${item.id}`, { append_to_response: 'credits' });
        
        const { data: titleRecord, error: titleErr } = await supabase.from('titles').upsert({
          title: d.title || d.name,
          year: parseInt((d.release_date || d.first_air_date || '').split('-')[0]) || 0,
          type: item.media_type === 'movie' ? 'movie' : 'series',
          poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
          overview: d.overview,
          published: true
        }, { onConflict: 'title' }).select().single();

        if (titleErr) throw titleErr;

        // Handle Genres
        if (d.genres) {
          for (const g of d.genres) {
            let { data: genreRecord } = await supabase.from('genres').select('id').eq('name', g.name).maybeSingle();
            if (!genreRecord) {
              const { data: nG } = await supabase.from('genres').insert({ name: g.name }).select().single();
              genreRecord = nG;
            }
            if (genreRecord) await supabase.from('title_genres').upsert({ title_id: titleRecord.id, genre_id: genreRecord.id });
          }
        }

        // Handle Cast
        if (d.credits?.cast) {
          const topCast = d.credits.cast.slice(0, 12);
          for (let i = 0; i < topCast.length; i++) {
            const actor = topCast[i];
            let { data: pRec } = await supabase.from('people').select('id').eq('name', actor.name).maybeSingle();
            if (!pRec) {
              const { data: nP } = await supabase.from('people').insert({
                name: actor.name,
                avatar: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null
              }).select().single();
              pRec = nP;
            }
            if (pRec) await supabase.from('cast_members').upsert({ title_id: titleRecord.id, person_id: pRec.id, role: actor.character, order: i });
          }
        }

        setMessage(`Success: Global Sync Complete for ${titleRecord.title}`);
      }
    } catch (err: any) { setMessage(`Sync Failed: ${err.message}`); }
    finally { setImportingId(null); setTimeout(() => setMessage(null), 4000); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-5 rounded-2xl space-y-4 border border-white/5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">TMDB Cloud Bridge</p>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
        </div>
        <input 
          type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)}
          className="w-full bg-black h-12 rounded-xl px-4 text-xs font-bold border border-white/5 focus:border-white/20 outline-none transition-all"
          placeholder="v3 API Key"
        />
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-black h-14 rounded-2xl px-5 text-sm font-bold border border-white/5 focus:border-white/20 outline-none transition-all"
          placeholder="Query Global Archives..."
        />
        <button type="submit" disabled={loading} className="px-6 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all active:scale-95">
          {loading ? 'SYNCING' : 'SEARCH'}
        </button>
      </form>

      {message && (
        <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
          {message}
        </div>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
        {results.map(r => (
          <div key={r.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="w-10 h-14 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                <img src={r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : (r.profile_path ? `https://image.tmdb.org/t/p/w185${r.profile_path}` : 'https://picsum.photos/100/150')} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-black truncate text-white">{r.title || r.name}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${r.media_type === 'movie' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {r.media_type}
                  </span>
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                    {r.release_date?.split('-')[0] || r.first_air_date?.split('-')[0]}
                  </span>
                </div>
              </div>
            </div>
            <button 
              disabled={!!importingId}
              onClick={() => handleImport(r)} 
              className={`px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${importingId === r.id ? 'bg-white/5 text-white/20 animate-pulse' : 'bg-white text-black hover:bg-gray-200 active:scale-95'}`}
            >
              {importingId === r.id ? 'SYNC' : 'SYNC'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ user: any }> = ({ user }) => {
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('sathyapriyan');
  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-1000">
      <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mb-8 opacity-20 shadow-2xl">🔐</div>
      <h1 className="text-xl font-black uppercase tracking-tighter mb-2">Unauthorized Terminal</h1>
      <Link to="/" className="mt-10 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Return Home</Link>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<AdminHome user={user} />} />
      <Route path="/import" element={<Layout title="External Archive Sync" user={user}><ImportModule user={user}/></Layout>} />
      <Route path="/titles" element={<Layout title="Archive Library" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Library Terminal Online</div></Layout>} />
      <Route path="/genres" element={<Layout title="Genre Architecture" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Structure Terminal Online</div></Layout>} />
      <Route path="/people" element={<Layout title="Personnel Archive" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Talent Terminal Online</div></Layout>} />
      <Route path="/home-sections" element={<Layout title="Layout Config" user={user}><div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">UX Terminal Online</div></Layout>} />
    </Routes>
  );
};

export default AdminDashboard;