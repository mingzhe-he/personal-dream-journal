
import React, { useState, useRef, useEffect } from 'react';
import { type Chat, type GenerateContentResponse } from '@google/genai';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon as BotIcon } from './Icons';

interface DreamChatProps {
  chat: Chat;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const DreamChat: React.FC<DreamChatProps> = ({ chat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chat.sendMessage({ message: input });
      const modelMessage: Message = { role: 'model', text: result.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-xl font-bold mb-4 text-center text-indigo-300">Ask About Your Dream</h3>
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon className="h-8 w-8 text-indigo-400 flex-shrink-0 mt-1" />}
            <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
             {msg.role === 'user' && <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <BotIcon className="h-8 w-8 text-indigo-400 flex-shrink-0 mt-1 animate-pulse" />
                <div className="rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                    <div className="h-2.5 bg-gray-600 rounded-full w-24 animate-pulse"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center border-t border-gray-700 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a symbol..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-l-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500"
          disabled={isLoading}
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-r-lg disabled:bg-indigo-800 disabled:cursor-not-allowed" disabled={isLoading}>
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};

export default DreamChat;
