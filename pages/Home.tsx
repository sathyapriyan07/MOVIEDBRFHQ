
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SectionRow from '../components/SectionRow';
import SearchField from '../components/SearchField';
import PosterCard from '../components/PosterCard';
import { Title } from '../types';
import { supabase, hasValidConfig } from '../lib/supabase';

interface HomeProps {
  filter?: 'movie' | 'series';
}

const Home: React.FC<HomeProps> = ({ filter }) => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [allTitles, setAllTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!hasValidConfig) { setLoading(false); return; }
      setLoading(true);
      try {
        const { data: sectionsData } = await supabase.from('home_sections').select('*, home_section_items(title_id)').order('order');
        const { data: titlesData } = await supabase.from('titles').select('*').order('created_at', { ascending: false });
        const validTitles = titlesData || [];
        setAllTitles(validTitles);
        const mappedSections = (sectionsData || []).map(section => ({
          ...section,
          items: (section.home_section_items || []).map((item: any) => validTitles.find(t => t.id === item.title_id)).filter(Boolean)
        }));
        setSections(mappedSections);
      } catch (error) { console.error('Fetch error:', error); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filteredTitles = useMemo(() => {
    let results = allTitles;
    if (filter) results = results.filter(t => t.type === filter);
    const query = searchQuery.trim().toLowerCase();
    if (query) results = results.filter(t => t.title.toLowerCase().includes(query));
    return results;
  }, [searchQuery, allTitles, filter]);

  if (loading) return (
    <div className="space-y-12 pt-8 px-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-4">
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(j => <div key={j} className="w-[110px] aspect-[2/3] bg-gray-900 rounded-lg border border-white/5"></div>)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 pt-6 animate-in fade-in duration-700 pb-12">
      <SearchField value={searchQuery} onChange={setSearchQuery} />
      
      {searchQuery.trim() ? (
        <div className="px-4 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">Search Results</h2>
          {filteredTitles.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredTitles.map(t => <PosterCard key={t.id} title={t} />)}
            </div>
          ) : (
            <div className="pt-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">No matches found in archive</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {sections.length > 0 ? sections.map(s => {
            let items = s.items;
            if (filter) items = items.filter((t: any) => t.type === filter);
            if (items.length === 0) return null;
            return <SectionRow key={s.id} title={s.title} items={items} />;
          }) : (
            <div className="pt-32 text-center">
              <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mx-auto opacity-10 mb-4 text-xl">🎬</div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">The archive is currently empty</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-800 mt-2">Sync data via Command Center</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
