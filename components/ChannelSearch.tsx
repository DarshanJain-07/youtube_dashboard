"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, ArrowRight } from 'lucide-react';
import { searchChannels } from '@/services/youtubeApi';

interface ChannelSearchProps {
  onChannelSelect: (channelId: string) => void;
  headingText?: string;
  onResultsChange?: (resultsCount: number) => void;
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

// Enhanced animation variants
const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  slideIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.08 } }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.03, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        repeatType: "reverse" as const
      } 
    }
  },
  errorAnim: {
    hidden: { opacity: 0, y: 5, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
  }
};

export default function ChannelSearch({ 
  onChannelSelect, 
  headingText = "",
  onResultsChange
}: ChannelSearchProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ChannelResult[]>([]);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(results.length);
    }
  }, [results, onResultsChange]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Use the searchChannels function from youtubeApi service
      const data = await searchChannels(query, 10);
      
      // Transform API results to our ChannelResult format
      const transformedResults = data.items
        .filter(item => item.id?.channelId && item.snippet) // Ensure required fields exist
        .map(item => ({
          id: {
            channelId: item.id.channelId!
          },
          snippet: {
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            thumbnails: {
              default: {
                url: item.snippet?.thumbnails?.default?.url || ''
              },
              medium: {
                url: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ''
              }
            },
            publishedAt: item.snippet?.publishedAt || ''
          }
        }));
      
      setResults(transformedResults);
      
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

  const handleClearResults = () => {
    setResults([]);
    setQuery('');
    if (onResultsChange) {
      onResultsChange(0);
    }
  };

  return (
    <div className="w-full mx-auto overflow-visible">
      {/* Heading with decorative element */}
      {headingText && (
        <div className="mb-6 flex items-center gap-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <motion.h2 
            initial="hidden"
            animate="visible"
            variants={animations.slideIn}
            className="text-xl md:text-2xl font-bold text-gray-800"
          >
            {headingText}
          </motion.h2>
        </div>
      )}
      
      {/* Enhanced search form with constrained width */}
      <motion.div
        initial="hidden"
        animate="visible" 
        variants={animations.slideIn}
        className="mb-8 w-full max-w-full"
      >
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-40 blur-md transform -translate-y-1 translate-x-1"></div>
          <div className={`relative flex items-center overflow-hidden bg-white border border-gray-200 ${focused ? 'ring-2 ring-blue-400 ring-opacity-50' : ''} rounded-xl transition-all duration-200 shadow-sm w-full`}>
            <div className="flex-shrink-0 flex items-center justify-center pl-4">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search for YouTube channels (e.g. MrBeast, PewDiePie)"
              className="flex-1 p-4 pl-3 outline-none bg-white text-gray-900 placeholder-gray-400 min-w-0 w-full"
              required
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            )}
            <motion.button 
              type="submit"
              disabled={isLoading}
              className="h-full px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Search</span>
                  <ArrowRight size={16} className="hidden sm:inline" />
                </div>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            variants={animations.errorAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-4 mb-6 rounded-lg bg-red-50 border border-red-100 text-red-500 text-sm flex items-start gap-2"
          >
            <div className="p-1 rounded-full bg-red-100 text-red-500 mt-0.5">
              <X size={14} />
            </div>
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={animations.fadeIn}
            className="space-y-4 w-full"
          >
            <motion.div 
              variants={animations.fadeIn}
              className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <div className="text-sm font-medium text-gray-700">
                  Found {results.length} channel{results.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button 
                onClick={handleClearResults}
                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
              >
                <X size={14} />
                <span>Clear</span>
              </button>
            </motion.div>
            
            <motion.div 
              variants={animations.stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              {results.map((channel, index) => (
                <motion.div 
                  key={channel.id.channelId}
                  variants={animations.slideIn}
                  whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChannelSelect(channel.id.channelId)}
                  className="group cursor-pointer w-full"
                >
                  <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 h-full">
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Channel thumbnail with background effect */}
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 blur-sm rounded-full"></div>
                          <div className="relative rounded-full overflow-hidden border-2 border-white shadow-sm">
                            {channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default.url ? (
                              <img 
                                src={channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default.url} 
                                alt={channel.snippet.title}
                                className="w-16 h-16 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/64?text=Channel';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-400">
                                <Search size={24} />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Channel info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-gray-900 group-hover:text-blue-700 transition-colors">
                            {channel.snippet.title}
                          </h3>
                          <p className="text-sm mt-1 line-clamp-2 text-gray-600">
                            {channel.snippet.description || "No description available"}
                          </p>
                        </div>
                      </div>
                      
                      {/* View button */}
                      <div className="mt-4 flex justify-end">
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                          <span>View channel</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}