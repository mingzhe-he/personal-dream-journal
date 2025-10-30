import React from 'react';
import { type DreamEntry } from '../types';
import { type Chat } from '@google/genai';
import DreamChat from './DreamChat';
import TagManager from './TagManager';
import { marked } from 'marked';

interface DreamDisplayProps {
  dream: DreamEntry;
  chat: Chat | null;
  onUpdateDream: (dream: DreamEntry) => void;
}

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dream, chat, onUpdateDream }) => {
  const interpretationHtml = marked(dream.interpretation);

  const handleTagsChange = (newTags: string[]) => {
    onUpdateDream({ ...dream, tags: newTags });
  };

  const handleLucidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDream({ ...dream, isLucid: e.target.checked });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-indigo-300 mb-2">{dream.date}</p>
          <div className="aspect-video w-full rounded-lg shadow-2xl shadow-indigo-900/40 overflow-hidden mb-6 bg-gray-800">
            <img src={dream.imageUrl} alt="Dream visualization" className="w-full h-full object-cover" />
          </div>
          
          <div className="mb-8">
             <h3 className="text-xl font-bold text-white mb-3">Dream Properties</h3>
             <div className="flex flex-wrap gap-4 items-start">
                <TagManager tags={dream.tags} onUpdate={handleTagsChange} />
                <div className="flex items-center space-x-2 pt-2">
                    <input
                        type="checkbox"
                        id="isLucid"
                        checked={dream.isLucid}
                        onChange={handleLucidChange}
                        className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-indigo-500 focus:ring-indigo-600"
                    />
                    <label htmlFor="isLucid" className="text-gray-300 font-medium">This was a lucid dream</label>
                </div>
             </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Psychological Interpretation</h2>
          <div 
            className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-indigo-300 prose-strong:text-white" 
            dangerouslySetInnerHTML={{ __html: interpretationHtml }}
          />
          <h2 className="text-3xl font-bold text-white mt-8 mb-4">Your Dream Transcription</h2>
          <p className="text-gray-400 italic leading-relaxed">{dream.transcription}</p>
        </div>
      </div>
      <div className="lg:w-1/3 bg-gray-900/60 backdrop-blur-sm border-l border-gray-700/50 flex flex-col">
        {chat ? <DreamChat chat={chat} /> : <div className="p-4 text-center">Loading chat...</div>}
      </div>
    </div>
  );
};

export default DreamDisplay;
