import React, { useState, useRef, useCallback, useMemo } from 'react';
import { type DreamEntry, type AppState } from './types';
import { type Chat, type LiveSession } from '@google/genai';
import { generateDreamImage, interpretDream, createDreamChat, startTranscriptionSession, analyzeDreamPatterns } from './services/geminiService';
import { MicrophoneIcon, StopCircleIcon, SparklesIcon } from './components/Icons';
import DreamDisplay from './components/DreamDisplay';
import Sidebar from './components/Sidebar';
import DreamAnalysis from './components/DreamAnalysis';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [dreamHistory, setDreamHistory] = useState<DreamEntry[]>([]);
  const [activeDream, setActiveDream] = useState<DreamEntry | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ keyword: string; tags: string }>({ keyword: '', tags: '' });
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const liveSessionRef = useRef<LiveSession | null>(null);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    setCurrentTranscription('');
    setAppState('recording');
    try {
      const sessionPromise = startTranscriptionSession((text) => {
        setCurrentTranscription(prev => prev + text);
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Microphone or session error:", err);
      setError("Could not start recording. Please ensure microphone permissions are granted.");
      setAppState('idle');
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }

    if (currentTranscription.trim().length < 10) {
        setError("Dream recording is too short. Please try again.");
        setAppState('idle');
        return;
    }

    setAppState('processing');
    setError(null);

    try {
      const [imageUrl, interpretation, chatSession] = await Promise.all([
        generateDreamImage(currentTranscription),
        interpretDream(currentTranscription),
        createDreamChat(currentTranscription),
      ]);

      const newDream: DreamEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        transcription: currentTranscription,
        imageUrl,
        interpretation,
        tags: [],
        isLucid: false,
      };

      setDreamHistory(prev => [newDream, ...prev]);
      setActiveDream(newDream);
      setActiveChat(chatSession);
      setAppState('viewing');
    } catch (err) {
      console.error("Error processing dream:", err);
      setError("An error occurred while analyzing your dream. Please try again.");
      setAppState('idle');
    } finally {
        setCurrentTranscription('');
    }
  }, [currentTranscription]);
  
  const selectDream = (dream: DreamEntry) => {
    setAppState('processing');
    setActiveDream(dream);
    createDreamChat(dream.transcription)
        .then(chat => {
            setActiveChat(chat);
            setAppState('viewing');
        })
        .catch(err => {
            console.error("Error creating chat for old dream:", err);
            setError("Could not start a chat for this dream.");
            setAppState('idle');
        });
  };

  const createNewDream = () => {
    setActiveDream(null);
    setActiveChat(null);
    setCurrentTranscription('');
    setError(null);
    setAppState('idle');
  };

  const updateDream = (updatedDream: DreamEntry) => {
    setDreamHistory(prev => prev.map(d => d.id === updatedDream.id ? updatedDream : d));
    if (activeDream?.id === updatedDream.id) {
      setActiveDream(updatedDream);
    }
  };

  const handleAnalyzePatterns = async () => {
    if (dreamHistory.length < 2) {
        setError("You need at least two dreams to analyze patterns.");
        setTimeout(() => setError(null), 3000);
        return;
    }
    setAppState('processing');
    setError(null);
    try {
        const result = await analyzeDreamPatterns(dreamHistory);
        setAnalysisResult(result);
        setAppState('viewingAnalysis');
    } catch (err) {
        console.error("Error analyzing patterns:", err);
        setError("Could not analyze dream patterns. Please try again.");
        setAppState('idle');
    }
  };


  const filteredDreams = useMemo(() => {
    return dreamHistory.filter(dream => {
        const keywordMatch = !filters.keyword || dream.transcription.toLowerCase().includes(filters.keyword.toLowerCase());
        const filterTags = filters.tags.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);
        const tagMatch = filterTags.length === 0 || filterTags.some(ft => dream.tags.some(dt => dt.toLowerCase().includes(ft)));
        return keywordMatch && tagMatch;
    });
  }, [dreamHistory, filters]);


  const renderContent = () => {
    switch (appState) {
      case 'recording':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-3xl font-bold text-indigo-300 mb-4">I'm Listening...</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">{currentTranscription || 'Begin speaking to record your dream.'}</p>
            <button
              onClick={handleStopRecording}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-75"
            >
              <StopCircleIcon className="h-10 w-10" />
            </button>
          </div>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <SparklesIcon className="h-16 w-16 text-indigo-400 animate-pulse mb-4" />
            <h2 className="text-3xl font-bold text-indigo-300 mb-2">Analyzing...</h2>
            <p className="text-lg text-gray-400">Unveiling the secrets of the subconscious...</p>
          </div>
        );
      case 'viewing':
        if (activeDream) {
          return <DreamDisplay dream={activeDream} chat={activeChat} onUpdateDream={updateDream} />;
        }
        return null;
      case 'viewingAnalysis':
        return <DreamAnalysis analysisText={analysisResult || ''} />;
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              Dream Journal
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl">Capture your dreams upon waking. Let AI unveil the secrets of your subconscious.</p>
            <button
              onClick={handleStartRecording}
              className="group relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
            >
                <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex items-center text-lg">
                    <MicrophoneIcon className="h-6 w-6 mr-3" />
                    Record a New Dream
                </span>
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen font-sans bg-gray-900 text-gray-100">
      <Sidebar
        dreams={filteredDreams}
        onSelectDream={selectDream}
        activeDreamId={activeDream?.id}
        onNewDream={createNewDream}
        onSearchChange={setFilters}
        onAnalyzePatterns={handleAnalyzePatterns}
      />
      <main className="flex-1 flex flex-col relative">
         <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
