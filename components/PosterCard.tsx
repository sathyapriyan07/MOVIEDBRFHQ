
import React from 'react';
import { Link } from 'react-router-dom';
import { Title } from '../types';

interface PosterCardProps {
  title: Title;
}

const PosterCard: React.FC<PosterCardProps> = ({ title }) => {
  return (
    <Link 
      to={`/title/${title.id}`}
      className="block group snap-start"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 group-hover:scale-105 group-hover:border-white/20">
        <img 
          src={title.poster || 'https://picsum.photos/400/600'} 
          alt={title.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
};

export default PosterCard;
