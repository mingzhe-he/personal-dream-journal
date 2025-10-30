import React, { useState } from 'react';
import { type DreamEntry } from '../types';
import DreamList from './DreamList';
import SearchAndFilter from './SearchAndFilter';
import LucidDreamingTools from './LucidDreamingTools';
import { ChatBubbleLeftRightIcon, BrainCircuitIcon, SparklesIcon } from './Icons';

interface SidebarProps {
  dreams: DreamEntry[];
  onSelectDream: (dream: DreamEntry) => void;
  activeDreamId?: number | null;
  onNewDream: () => void;
  onSearchChange: (filters: { keyword: string; tags: string }) => void;
  onAnalyzePatterns: () => void;
}

type Tab = 'dreams' | 'analysis';

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab>('dreams');

  return (
    <aside className="w-1/4 max-w-sm bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Dream Journal</h1>
            <button onClick={props.onNewDream} title="Record New Dream" className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/70 rounded-full p-2 transition">
                <span className="sr-only">Record New Dream</span>
                <SparklesIcon className="h-6 w-6" />
            </button>
         </div>
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dreams')}
            className={`w-full p-2 text-sm font-semibold rounded-md transition ${activeTab === 'dreams' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            My Dreams
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`w-full p-2 text-sm font-semibold rounded-md transition ${activeTab === 'analysis' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Analysis & Tools
          </button>
        </div>
      </div>

      {activeTab === 'dreams' && (
        <div className="flex flex-col flex-1 overflow-hidden p-4">
            <SearchAndFilter onSearchChange={props.onSearchChange} />
            <DreamList dreams={props.dreams} onSelectDream={props.onSelectDream} activeDreamId={props.activeDreamId} />
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <BrainCircuitIcon className="h-5 w-5 mr-2 text-indigo-400" />
                    Pattern Analysis
                </h3>
                <p className="text-sm text-gray-400 mb-3">Discover recurring themes, symbols, and emotions across all your dreams.</p>
                <button
                    onClick={props.onAnalyzePatterns}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Analyze All Dreams
                </button>
            </div>
            <LucidDreamingTools />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
