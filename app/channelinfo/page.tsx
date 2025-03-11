"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getChannelDetails } from '@/services/youtubeApi';
import { Users, Eye, Video, Loader2, BarChart2, TrendingUp, Users as UsersIcon, MessageCircle, ListVideo, Calendar, MessageSquare, Share2, Zap, X } from 'lucide-react';
import { formatNumber } from '@/components/utils';
import ChannelActivity from '@/components/ChannelActivity';

// Dashboard type definition
type DashboardType = 'latestvideos';

// Dashboard components - replace with your actual components
const LatestVideos = () => {
  // Get channelId from state to avoid using localStorage directly in JSX
  // This ensures we have a string and avoids null values
  const [channelId, setChannelId] = useState<string>("");
  
  useEffect(() => {
    // Access localStorage safely in useEffect (client-side only)
    const storedChannelId = localStorage.getItem('selectedChannelId');
    if (storedChannelId) {
      setChannelId(storedChannelId);
    }
  }, []);
  
  // Only render the component when we have a valid channelId
  if (!channelId) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }
  
  return <ChannelActivity channelId={channelId} />;
};


// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function ChannelInfoPage() {
  const router = useRouter();
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<'latestvideos'>('latestvideos');


  // Limit description to specified word count
  const limitWords = (text: string, wordCount: number) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  useEffect(() => {
    // Retrieve the channelId from localStorage
    const storedChannelId = localStorage.getItem('selectedChannelId');
    
    if (storedChannelId) {
      setChannelId(storedChannelId);
      
      // Fetch channel data
      const fetchChannelData = async () => {
        try {
          setLoading(true);
          // Use getChannelDetails instead of getChannelInfo to get all channel data
          const response = await getChannelDetails(storedChannelId);
          
          if (response.items.length === 0) {
            throw new Error('Channel not found');
          }
          
          const channelData = response.items[0];
          console.log('Raw channel data:', channelData);
          setChannelData(channelData);
        } catch (err) {
          console.error('Error fetching channel data:', err);
          setError('Failed to load channel data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchChannelData();
    } else {
      // If no channelId is found, redirect back to the search page
      router.push('/');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading channel information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md">
          <h2 className="text-red-500 font-bold text-xl mb-3">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">No channel data available</div>
      </div>
    );
  }

  // Get the channel thumbnail URL, title, and description from the correct structure
  const thumbnailUrl = channelData.snippet?.thumbnails?.high?.url || 
                      channelData.snippet?.thumbnails?.medium?.url || 
                      channelData.snippet?.thumbnails?.default?.url || 
                      null;
  const title = channelData.snippet?.title || 'Unknown Channel';
  const description = channelData.snippet?.description || 'No description available';
  const limitedDescription = limitWords(description, 150);

  // Extract existing stats
  const subscriberCount = channelData.statistics?.subscriberCount;
  const viewCount = channelData.statistics?.viewCount;
  const videoCount = channelData.statistics?.videoCount;
  
  // Extract additional requested data
  const publishedAt = channelData.snippet?.publishedAt;
  const formattedPublishedAt = publishedAt ? new Date(publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  
  const commentCount = channelData.statistics?.commentCount;
  const hiddenSubscriberCount = channelData.statistics?.hiddenSubscriberCount;
  const topicIds = channelData.topicDetails?.topicIds || [];
  const topicCategories = channelData.topicDetails?.topicCategories || [];
  const channelKeywords = channelData.brandingSettings?.channel?.keywords || '';


  // Render the appropriate dashboard component
  const renderDashboard = () => {
    return <LatestVideos />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-5xl mx-auto"
      >
        <motion.div 
          className="mb-6 flex items-center gap-2"
          variants={fadeInRight}
        >
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 shadow-md hover:shadow-lg"
          >
            ← Back
          </button>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-5"
          variants={stagger}
        >
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left column: Channel profile and title */}
              <motion.div 
                className="md:col-span-3"
                variants={fadeIn}
              >
                {/* Channel thumbnail with subtle styling */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-sm rounded-lg"></div>
                  <div className="relative p-1 bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={title}
                        className="w-full aspect-square object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150?text=Channel';
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Channel title and ID */}
                <div className="text-center md:text-left">
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-2 mb-1">{title}</h1>
                  <div className="text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{channelId}</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Middle column: Stats and description */}
              <motion.div 
                className="md:col-span-9"
                variants={fadeIn}
              >
                {/* Stats in horizontal layout */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <Users size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Subscribers</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {hiddenSubscriberCount ? 'Hidden' : (subscriberCount ? formatNumber(subscriberCount) : 'N/A')}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Eye size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Total Views</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {viewCount ? formatNumber(viewCount) : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Video size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Videos</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {videoCount ? formatNumber(videoCount) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Additional stats in horizontal layout */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <Calendar size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Created On</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {formattedPublishedAt}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                        <TrendingUp size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Avg. Views per Video</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {viewCount && videoCount ? formatNumber(Math.round(parseInt(viewCount) / parseInt(videoCount))) : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center h-full shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative group">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Share2 size={14} />
                      </div>
                      <span className="text-xs text-gray-500">Engagement Rate</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {subscriberCount && viewCount && videoCount ? 
                        Math.round((parseInt(viewCount) / parseInt(videoCount)) / parseInt(subscriberCount) * 100) + '%' 
                        : 'N/A'}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-50 text-gray-700 text-xs rounded-md p-3 shadow-xl drop-shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none border border-gray-200">
                      <p className="font-medium text-gray-800 mb-1">Engagement Rate</p>
                      <p>Average views per video divided by subscriber count, showing what percentage of subscribers watch each video on average.</p>
                    </div>
                  </div>
                </div>
                
                {/* About section */}
                <div className="bg-gradient-to-tr from-gray-50 to-white p-4 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    <h2 className="text-base font-semibold text-gray-800">About this Channel</h2>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-12">
                    {limitedDescription}
                  </p>
                </div>

                {/* Channel topics and keywords section */}
                {(topicCategories.length > 0 || topicIds.length > 0 || channelKeywords) && (
                  <div className="bg-gradient-to-tr from-gray-50 to-white p-4 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      <h2 className="text-base font-semibold text-gray-800">Topics & Keywords</h2>
                    </div>
                    
                    {topicCategories.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-xs font-medium text-gray-500 mb-1">Topic Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {topicCategories.map((topic: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full shadow-sm hover:shadow transition-shadow">
                              {topic.split('/').pop()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {topicIds.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-xs font-medium text-gray-500 mb-1">Topic IDs</h3>
                        <div className="flex flex-wrap gap-2">
                          {topicIds.map((topicId: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-mono shadow-sm hover:shadow transition-shadow">
                              {topicId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {channelKeywords && (
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 mb-1">Channel Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {channelKeywords.split(/\s+/).map((keyword: string, index: number) => (
                            keyword && (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full shadow-sm hover:shadow transition-shadow">
                                {keyword}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Dashboard section as separate card below */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          variants={fadeIn}
        >
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Latest Videos</h2>
          </div>
          
          <div className="border-t border-gray-200">
            {renderDashboard()}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
