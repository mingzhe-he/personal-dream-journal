import React from 'react';
import { type DreamEntry } from '../types';
import { EyeIcon } from './Icons';

interface DreamListProps {
  dreams: DreamEntry[];
  onSelectDream: (dream: DreamEntry) => void;
  activeDreamId: number | null | undefined;
}

const DreamList: React.FC<DreamListProps> = ({ dreams, onSelectDream, activeDreamId }) => {
  if (dreams.length === 0) {
    return <p className="text-gray-500 text-center mt-4">No dreams found.</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2">
      <ul className="space-y-2">
        {dreams.map((dream) => (
          <li key={dream.id}>
            <button
              onClick={() => onSelectDream(dream)}
              className={`w-full text-left p-3 rounded-lg transition ${
                activeDreamId === dream.id 
                ? 'bg-indigo-500/30 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold truncate pr-2">{dream.transcription}</p>
                {dream.isLucid && <EyeIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-500 mt-1">{dream.date}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DreamList;
