import React, { useState } from 'react';

interface SearchAndFilterProps {
  onSearchChange: (filters: { keyword: string; tags: string }) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onSearchChange }) => {
  const [keyword, setKeyword] = useState('');
  const [tags, setTags] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'keyword' | 'tags') => {
    const value = e.target.value;
    const newKeyword = type === 'keyword' ? value : keyword;
    const newTags = type === 'tags' ? value : tags;
    
    if (type === 'keyword') setKeyword(value);
    if (type === 'tags') setTags(value);
    
    onSearchChange({ keyword: newKeyword, tags: newTags });
  };

  return (
    <div className="mb-4 space-y-3">
      <input
        type="text"
        placeholder="Search by keyword..."
        value={keyword}
        onChange={(e) => handleInputChange(e, 'keyword')}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500"
      />
      <input
        type="text"
        placeholder="Filter by tags (e.g., fly, water)"
        value={tags}
        onChange={(e) => handleInputChange(e, 'tags')}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500"
      />
    </div>
  );
};

export default SearchAndFilter;
