"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, HelpCircle, TrendingUp, BarChart2, Users, Search, Loader2 } from "lucide-react";
import { formatNumber } from '@/components/utils'

// Define interfaces
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

export default function YoutubePage() {
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ChannelResult[]>([]);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerCards = {
    container: {
      animate: { 
        transition: { 
          staggerChildren: 0.1 
        } 
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-between items-center w-full py-3 px-3 sm:px-6 bg-white rounded-b-xl shadow-sm border-b border-gray-100"
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white font-bold text-sm">YT</div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Studio <span className="text-gray-400 font-normal">Analytics</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2 sm:gap-5">
            <motion.a
              href="#"
              className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle size={16} />
              <span>Help</span>
            </motion.a>
            <motion.a
              href="#"
              className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </motion.a>
            <motion.a
              href="#"
              className="sm:hidden text-gray-600 hover:text-gray-900"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle size={20} />
            </motion.a>
            <motion.a
              href="#"
              className="sm:hidden text-gray-600 hover:text-gray-900"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={20} />
            </motion.a>
            <motion.button 
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.97 }}
            >
              <Bell size={18} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        </motion.header>
        
        <main className="relative mt-4 sm:mt-8 mb-16 sm:mb-20 max-w-6xl mx-auto px-2">
          <AnimatePresence mode="wait">
              <motion.div
                key="search"
                {...fadeInUp}
                className="space-y-6 sm:space-y-8"
              >
                {/* Search Section */}
                <div className="text-center mb-8 sm:mb-12">
                  <motion.h2 
                    className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Analyze Your YouTube Performance
                  </motion.h2>
                  <motion.p 
                    className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Get insights, track growth, and optimize your content strategy
                  </motion.p>
                </div>

                <div className="w-full max-w-3xl mx-auto">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl md:text-2xl font-bold mb-6 text-gray-800"
                  >
                    Search here to know more about 👇
                  </motion.h2>
                  
                  <motion.form 
                    onSubmit={handleSearch} 
                    className="mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className={`relative flex items-center overflow-hidden bg-white border-gray-300 border ${focused ? 'ring-2 ring-blue-500 ring-opacity-30' : ''} rounded-xl transition-all duration-200 shadow-sm`}>
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
                        className="h-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                              onClick={() => handleChannelSelect(channel.id.channelId)}
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
                                      src={channel.snippet.thumbnails.medium?.url} 
                                      alt={channel.snippet.title}
                                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                                    />
                                    {channel.statistics?.subscriberCount && (
                                      <div className="absolute -bottom-1 -right-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-500 text-white">
                                        {formatNumber(channel.statistics.subscriberCount)}
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
                                      <span className="font-medium">{formatNumber(channel.statistics.videoCount)}</span> videos
                                    </div>
                                  )}
                                  {channel.statistics.viewCount && (
                                    <div>
                                      <span className="font-medium">{formatNumber(channel.statistics.viewCount)}</span> views
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
              
              <motion.div
                variants={staggerCards.container}
                initial="initial"
                animate="animate"
                className="mt-12 sm:mt-16"
              >
                <h3 className={`text-lg font-medium text-gray-800 mb-6 sm:mb-8 px-1`}>Why use YT Studio Analytics?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {[
                    { 
                      icon: <TrendingUp size={24} className="text-red-500" />, 
                      title: "Real-time Performance", 
                      description: "Monitor views, engagement, and subscriber growth with up-to-the-minute data",
                      color: "from-red-500 to-red-400"
                    },
                    { 
                      icon: <BarChart2 size={24} className="text-blue-500" />, 
                      title: "Audience Insights", 
                      description: "Understand your viewers with deep demographic and behavioral analytics",
                      color: "from-blue-500 to-blue-400" 
                    },
                    { 
                      icon: <Users size={24} className="text-green-500" />, 
                      title: "Community Building", 
                      description: "Grow a loyal audience using AI-powered content strategy recommendations",
                      color: "from-green-500 to-green-400"
                    }
                  ].map((card, index) => (
                    <motion.div
                      key={index}
                      variants={staggerCards.item}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`rounded-xl overflow-hidden bg-white border-gray-200 border shadow-sm transition-all duration-300`}
                    >
                      <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                      <div className="p-6">
                        <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                          {card.icon}
                        </div>
                        <h4 className='font-semibold text-lg mb-2 text-black'>{card.title}</h4>
                        <p className='text-gray-500 text-sm'>{card.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
        </AnimatePresence>
      </main>
    </div>
  </div>
);
}