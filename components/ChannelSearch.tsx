"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

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
      medium: {
        url: string;
      };
    };
    customUrl?: string;
    publishedAt: string;
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
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
  const [focused, setFocused] = useState(false);

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

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format subscriber count
  const formatCount = (count?: string) => {
    if (!count) return 'N/A';
    const num = parseInt(count);
    if (num > 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num > 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-bold mb-6 text-gray-800"
      >
        {headingText}
      </motion.h2>
      
      <motion.form 
        onSubmit={handleSearch} 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`relative flex items-center overflow-hidden bg-white border-gray-300 border ${focused ? 'ring-2 ring-red-500 ring-opacity-30' : ''} rounded-xl transition-all duration-200 shadow-sm`}>
          <div className="flex items-center justify-center pl-4">
            <Search size={20} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="MrBeast?"
            className="flex-1 p-4 pl-3 outline-none bg-white text-gray-900 placeholder-gray-400"
            required
          />
          <motion.button 
            type="submit"
            disabled={isLoading}
            className="h-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              'Search'
            )}
          </motion.button>
        </div>
      </motion.form>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 mb-6 rounded-lg bg-red-50 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium mb-4 text-gray-500"
            >
              Found {results.length} channel{results.length !== 1 ? 's' : ''}
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((channel, index) => (
                <motion.div 
                  key={channel.id.channelId}
                  className="bg-white border-gray-200 hover:bg-gray-50 border rounded-xl overflow-hidden shadow-sm cursor-pointer transition-colors duration-200"
                  onClick={() => onChannelSelect(channel.id.channelId)}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1.0]
                  }}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default.url} 
                          alt={channel.snippet.title}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white"
                        />
                        {channel.statistics?.subscriberCount && (
                          <div className="absolute -bottom-1 -right-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-500 text-white">
                            {formatCount(channel.statistics.subscriberCount)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-gray-900">
                          {channel.snippet.title}
                        </h3>
                        {channel.snippet.customUrl && (
                          <p className="text-sm text-gray-500">
                            @{channel.snippet.customUrl}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-gray-400">
                          Joined {formatDate(channel.snippet.publishedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm mt-3 line-clamp-2 text-gray-600">
                      {channel.snippet.description || "No description available"}
                    </p>
                    
                    {channel.statistics && (
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        {channel.statistics.videoCount && (
                          <div>
                            <span className="font-medium">{formatCount(channel.statistics.videoCount)}</span> videos
                          </div>
                        )}
                        {channel.statistics.viewCount && (
                          <div>
                            <span className="font-medium">{formatCount(channel.statistics.viewCount)}</span> views
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}