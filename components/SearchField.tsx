
import React from 'react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange }) => {
  return (
    <div className="w-full px-4 mb-4">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-gray-500 text-sm">🔍</span>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search movies, series, people..."
          className="w-full h-[44px] bg-gray-800 rounded-xl pl-11 pr-4 text-[13px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/10 placeholder:text-gray-500 transition-all"
        />
      </div>
    </div>
  );
};

export default SearchField;
