
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, hasValidConfig } from '../lib/supabase';

const TitleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Cast' | 'Links'>('Overview');
  const [titleData, setTitleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!hasValidConfig) { setLoading(false); return; }
      try {
        const { data: title } = await supabase.from('titles').select('*, cast_members(*, person:people(*))').eq('id', id).single();
        setTitleData(title);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Loading...</div>;
  if (!titleData) return <div className="pt-20 text-center text-gray-500 text-xs">Title not found</div>;

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in duration-500 pb-24">
      <div className="sticky top-[56px] z-30 px-4 py-4 bg-black/60 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all">
          ← Back
        </button>
      </div>

      <div className="flex flex-col items-center px-4 space-y-6 mt-4">
        <div className="w-[160px] md:w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-gray-900">
          <img src={titleData.poster} className="w-full h-full object-cover" alt={titleData.title} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight leading-tight">{titleData.title}</h1>
          <p className="text-[11px] text-gray-500 font-black tracking-widest mt-1 uppercase">{titleData.year} • {titleData.type}</p>
        </div>
      </div>

      <div className="flex justify-center space-x-2 mt-10 px-4">
        {['Overview', 'Cast', 'Links'].map((tab: any) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-black' : 'bg-gray-900 text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-6 mt-8 max-w-2xl mx-auto min-h-[300px]">
        {activeTab === 'Overview' && (
          <p className="text-[14px] text-gray-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2">
            {titleData.overview}
          </p>
        )}
        {activeTab === 'Cast' && (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x animate-in fade-in">
            {titleData.cast_members?.map((c: any) => (
              <Link key={c.id} to={`/person/${c.person?.id}`} className="flex flex-col items-center space-y-3 shrink-0 snap-start">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden border border-white/10 bg-gray-900">
                  <img src={c.person?.avatar || 'https://picsum.photos/120/120'} className="w-full h-full object-cover grayscale" alt="" />
                </div>
                <div className="text-center w-20">
                  <p className="text-[10px] font-black uppercase tracking-tight text-white line-clamp-1">{c.person?.name}</p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5 line-clamp-1">{c.role}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {activeTab === 'Links' && (
          <div className="space-y-3 animate-in fade-in">
            <button className="w-full py-4 bg-gray-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800">
              Watch Trailer
            </button>
            <button className="w-full py-4 bg-gray-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800">
              IMDb Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleDetail;
