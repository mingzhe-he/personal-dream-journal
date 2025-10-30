import React from 'react';
import { marked } from 'marked';
import { BrainCircuitIcon } from './Icons';

interface DreamAnalysisProps {
  analysisText: string;
}

const DreamAnalysis: React.FC<DreamAnalysisProps> = ({ analysisText }) => {
  const analysisHtml = marked(analysisText);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center text-3xl font-bold text-white mb-6">
                <BrainCircuitIcon className="h-10 w-10 mr-4 text-indigo-400" />
                <h1>Dream Pattern Analysis</h1>
            </div>
            <div
                className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-indigo-300 prose-strong:text-white prose-li:marker:text-indigo-400"
                dangerouslySetInnerHTML={{ __html: analysisHtml }}
            />
        </div>
    </div>
  );
};

export default DreamAnalysis;
