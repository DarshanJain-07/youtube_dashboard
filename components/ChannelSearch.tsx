// components/ChannelSearch.tsx
"use client";

import { useState } from 'react';

interface ChannelSearchProps {
  onChannelSelect: (channelId: string) => void;
  headingText?: string;
}

interface ChannelResult {
  id: {
    channelId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export default function ChannelSearch({ 
  onChannelSelect, 
  headingText = ""
}: ChannelSearchProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ChannelResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/youtube/search-channels?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search channels');
      }
      
      const data = await response.json();
      setResults(data.items || []);
      
      if (data.items.length === 0) {
        setError('No channels found. Try a different search term.');
      }
    } catch (err) {
      setError('Error searching for channels. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-black">{headingText}</h2>     
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="MrBeast?"
            className="flex-1 p-2 border border-gray-300 rounded-md text-black"
            required
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((channel) => (
            <div 
              key={channel.id.channelId}
              className="border border-gray-200 rounded-md p-4 cursor-pointer hover:bg-transparent"
              onClick={() => onChannelSelect(channel.id.channelId)}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={channel.snippet.thumbnails.default.url} 
                  alt={channel.snippet.title}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-black">{channel.snippet.title}</h3>
                  <p className="text-sm text-gray-500">{channel.snippet.description.substring(0, 100)}...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}