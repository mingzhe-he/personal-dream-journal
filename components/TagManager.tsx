import React, { useState } from 'react';
import { TagIcon } from './Icons';

interface TagManagerProps {
  tags: string[];
  onUpdate: (newTags: string[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, onUpdate }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onUpdate([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex-1">
      <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg p-2">
        <TagIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {tags.map(tag => (
            <span key={tag} className="flex items-center bg-indigo-500/50 text-indigo-100 text-sm font-medium px-2.5 py-1 rounded-full">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-indigo-200 hover:text-white">
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="bg-transparent focus:outline-none text-white placeholder-gray-500 flex-1 min-w-[80px]"
          />
        </div>
      </div>
    </div>
  );
};

export default TagManager;
