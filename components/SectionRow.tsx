
import React from 'react';
import PosterCard from './PosterCard';
import { Title } from '../types';

interface SectionRowProps {
  title: string;
  items: Title[];
}

const SectionRow: React.FC<SectionRowProps> = ({ title, items }) => {
  return (
    <section className="space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[13px] font-black text-white uppercase tracking-[0.1em]">{title}</h2>
        <div className="flex items-center space-x-1 group cursor-pointer">
          <span className="text-gray-700 text-[10px] font-bold group-hover:text-white transition-colors">&gt;</span>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x px-4 pb-2">
        {items.map((item) => (
          <div key={item.id} className="w-[110px] sm:w-[130px] flex-shrink-0">
            <PosterCard title={item} />
          </div>
        ))}
        <div className="w-1 flex-shrink-0" />
      </div>
    </section>
  );
};

export default SectionRow;
