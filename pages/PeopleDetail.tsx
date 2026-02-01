
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, hasValidConfig } from '../lib/supabase';

const PeopleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'biography' | 'filmography'>('biography');
  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerson() {
      if (!hasValidConfig) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: person, error } = await supabase
          .from('people')
          .select(`
            *,
            cast_members(title:titles(*), role),
            crew(title:titles(*), role)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;

        // Map filmography with role context
        const worksMap = new Map();
        
        person.cast_members?.forEach((c: any) => {
          if (!c.title) return;
          if (!worksMap.has(c.title.id)) {
            worksMap.set(c.title.id, { ...c.title, roles: [] });
          }
          const roleText = c.role || 'Cast';
          if (!worksMap.get(c.title.id).roles.includes(roleText)) {
            worksMap.get(c.title.id).roles.push(roleText);
          }
        });

        person.crew?.forEach((c: any) => {
          if (!c.title) return;
          if (!worksMap.has(c.title.id)) {
            worksMap.set(c.title.id, { ...c.title, roles: [] });
          }
          const roleText = c.role || 'Crew';
          if (!worksMap.get(c.title.id).roles.includes(roleText)) {
            worksMap.get(c.title.id).roles.push(roleText);
          }
        });

        setPersonData({
          ...person,
          filmography: Array.from(worksMap.values()).sort((a: any, b: any) => (b.year || 0) - (a.year || 0))
        });
      } catch (err) {
        console.error('Error fetching person:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerson();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 animate-pulse">Loading Professional Profile...</div>
    </div>
  );
  
  if (!hasValidConfig && !personData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center opacity-20">👤</div>
        <div className="space-y-2">
           <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Database Offline</h2>
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
             Professional talent data is currently unavailable in this preview.
           </p>
        </div>
        <button onClick={() => navigate('/')} className="text-white text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-1">Return Home</button>
      </div>
    );
  }

  if (!personData) return (
    <div className="p-20 text-center">
      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Profile not found</p>
      <button onClick={() => navigate('/')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-white border-b border-white/20 pb-1">Browse Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-4 pb-24 animate-in fade-in duration-500 overflow-x-hidden scrollbar-hide">
      <div className="mb-10">
        <button onClick={() => navigate(-1)} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all flex items-center group">
          <span className="mr-2 text-lg font-light group-hover:-translate-x-1 transition-transform">&lt;</span> Back
        </button>
      </div>

      <div className="flex flex-col items-center space-y-7 mb-14">
        <div className="relative group">
          <div className="w-[140px] aspect-square rounded-[40px] overflow-hidden bg-gray-900 border border-white/5 shadow-2xl relative z-10">
            <img 
              src={personData.avatar || `https://picsum.photos/300/300?random=${personData.id}`} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              alt={personData.name} 
            />
          </div>
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
        </div>
        <div className="text-center px-4">
          <h1 className="text-3xl font-black tracking-tighter uppercase">{personData.name}</h1>
          <div className="flex items-center justify-center space-x-3 mt-2">
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Cinema Professional</span>
            <span className="text-gray-800 text-[10px]">•</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">{personData.filmography.length} Credits</span>
          </div>
        </div>
      </div>

      <div className="flex bg-gray-900/60 rounded-full p-1 mb-12 max-w-[280px] mx-auto border border-white/5 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('biography')}
          className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'biography' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Bio
        </button>
        <button 
          onClick={() => setActiveTab('filmography')}
          className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
            activeTab === 'filmography' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Works
        </button>
      </div>

      <div className="px-1 max-w-2xl mx-auto">
        {activeTab === 'biography' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-8">
            <p className="text-[14px] text-gray-200 font-bold leading-relaxed whitespace-pre-wrap">
              {personData.biography || 'Biography details for this cinema professional are currently being curated by our editorial team.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Industry Role</span>
                <p className="text-[11px] font-bold text-white uppercase tracking-tight">Multi-disciplinary</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Total Works</span>
                <p className="text-[11px] font-bold text-white uppercase tracking-tight">{personData.filmography.length} Documented</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filmography' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {personData.filmography.map((work: any) => (
              <Link 
                key={work.id} 
                to={`/title/${work.id}`} 
                className="flex flex-col space-y-3 group"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 border border-white/5 group-hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-xl relative">
                  <img src={work.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={work.title} />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[7px] font-black text-white uppercase tracking-widest">{work.year}</span>
                  </div>
                </div>
                <div className="px-1 space-y-1">
                  <h4 className="text-[11px] font-black uppercase tracking-tight line-clamp-1 text-white group-hover:text-gray-300 transition-colors">{work.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {work.roles.map((role: string, idx: number) => (
                      <span key={idx} className="text-gray-600 text-[8px] font-black uppercase tracking-wider">
                        {role}{idx < work.roles.length - 1 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
            {personData.filmography.length === 0 && (
              <p className="col-span-full py-24 text-center text-[10px] text-gray-700 font-black uppercase tracking-widest">No documented works in the archive.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleDetail;
