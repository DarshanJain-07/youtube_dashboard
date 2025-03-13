"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getChannelDetails, getFeaturedChannels, getFormattedVideoData, getChannelVideos } from '@/services/youtubeApi';
import { 
  Users, Eye, Video, Loader2, TrendingUp, 
  Users as UsersIcon, Calendar, Share2, ExternalLink, 
  Award, Activity, Gauge, Repeat, TrendingUp as TrendingUpIcon, Layers, ArrowUpRight, Clock, Filter, Search, BarChart4
} from 'lucide-react';
import { 
  formatNumber, formatDateLong, 
  calculateSubscriberConversionRate,
  calculateChannelActivityRatio,
  calculateChannelEfficiencyIndex,
  calculateAudienceRetentionStrength,
  calculateChannelGrowthMomentum,
  calculateContentSubscriberEfficiency,
  calculateChannelRating,
  limitWords,
  fadeIn,
  stagger,
  fadeInRight,
  addMarqueeStylesToDocument,
  updateTooltipData
} from '@/components/utils';
import { DashboardType, ChannelMetrics, TooltipState } from '@/components/types';
import ChannelActivity from '@/components/ChannelActivity';
import ChannelGraphs from '@/components/ChannelGraphs';

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

export default function ChannelInfoPage() {
  const router = useRouter();
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherChannels, setOtherChannels] = useState<any[]>([]);
  const [loadingOtherChannels, setLoadingOtherChannels] = useState(false);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetrics>({} as ChannelMetrics);
  const [videoData, setVideoData] = useState<any[]>([]);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('videos');
  
  // Enhanced tooltip state
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    active: false,
    id: null,
    title: '',
    content: '',
    x: 0,
    y: 0,
    isTop: false
  });
  
  // Refs for tracking tooltip state
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentHoveredElementRef = useRef<HTMLElement | null>(null);
  const tooltipContainerRef = useRef<HTMLDivElement | null>(null);

  // Apply marquee styles on component mount
  useEffect(() => {
    addMarqueeStylesToDocument();
  }, []);

  // Clear any pending timeouts
  const clearTooltipTimeout = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

  // Handle mouse move events globally
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const cardElement = targetElement.closest('[data-tooltip-id]') as HTMLElement | null;
    
    if (cardElement !== currentHoveredElementRef.current) {
      // Element changed
      clearTooltipTimeout();
      
      if (cardElement) {
        // Mouse entered a new tooltip element
        currentHoveredElementRef.current = cardElement;
        
        // Show tooltip after a short delay
        tooltipTimeoutRef.current = setTimeout(() => {
          const tooltipData = updateTooltipData(cardElement);
          setTooltipState({
            active: true,
            id: tooltipData.id || null,
            title: tooltipData.title || '',
            content: tooltipData.content || '',
            x: tooltipData.x || 0,
            y: tooltipData.y || 0,
            isTop: tooltipData.isTop || false
          });
        }, 30); // Shorter delay for more responsive feel
      } else {
        // Mouse left a tooltip element
        currentHoveredElementRef.current = null;
        
        // Hide tooltip after a short delay
        tooltipTimeoutRef.current = setTimeout(() => {
          setTooltipState(prev => ({ ...prev, active: false }));
        }, 80);
      }
    }
  }, [clearTooltipTimeout]);

  // Set up global mouse tracker
  useEffect(() => {
    // Add the event listener to the document for global tracking
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleMouseMove);
      clearTooltipTimeout();
    };
  }, [handleMouseMove, clearTooltipTimeout]);

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
          
          // Fetch video data for channel metrics calculations
          try {
            // First, get channel's videos
            const channelVideosResponse = await getChannelVideos(storedChannelId, 20);
            
            // If no videos are found, set empty arrays
            if (!channelVideosResponse.items || channelVideosResponse.items.length === 0) {
              console.log('No videos found for this channel');
              setVideoData([]);
              setTopTags([]);
            } else {
              // Extract video IDs from search results
              const videoIds = channelVideosResponse.items
                .filter(item => item.id && item.id.videoId)
                .map(item => item.id.videoId as string);
              
              console.log('Found video IDs:', videoIds);
              
              // If we have video IDs, get the detailed data
              if (videoIds.length > 0) {
                const videoDetails = await getFormattedVideoData(videoIds);
                console.log('Fetched video data:', videoDetails);
                
                // Set the video data state
                setVideoData(videoDetails);
                
                // Process tags from the videos
                const tagCounts: {[key: string]: number} = {};
                
                videoDetails.forEach(video => {
                  if (video.tags && video.tags.length) {
                    video.tags.forEach(tag => {
                      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                  }
                });
                
                // Sort tags by count and get top 5
                const sortedTags = Object.keys(tagCounts)
                  .sort((a, b) => tagCounts[b] - tagCounts[a])
                  .slice(0, 5);
                
                setTopTags(sortedTags);
                
                // Calculate channel metrics
                const metrics: ChannelMetrics = {
                  subscriberConversionRate: calculateSubscriberConversionRate({
                    subscriberCount: parseInt(channelData.statistics.subscriberCount),
                    viewCount: parseInt(channelData.statistics.viewCount),
                    publishedAt: channelData.snippet.publishedAt,
                    videoCount: parseInt(channelData.statistics.videoCount),
                    hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                    commentCount: parseInt(channelData.statistics.commentCount),
                    topicIds: channelData.topicDetails?.topicIds || [],
                    topicCategories: channelData.topicDetails?.topicCategories || [],
                    keywords: channelData.brandingSettings?.channel?.keywords || ''
                  }),
                  channelActivityRatio: calculateChannelActivityRatio({
                    subscriberCount: parseInt(channelData.statistics.subscriberCount),
                    viewCount: parseInt(channelData.statistics.viewCount),
                    publishedAt: channelData.snippet.publishedAt,
                    videoCount: parseInt(channelData.statistics.videoCount),
                    hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                    commentCount: parseInt(channelData.statistics.commentCount),
                    topicIds: channelData.topicDetails?.topicIds || [],
                    topicCategories: channelData.topicDetails?.topicCategories || [],
                    keywords: channelData.brandingSettings?.channel?.keywords || ''
                  }),
                  audienceRetentionStrength: calculateAudienceRetentionStrength({
                    subscriberCount: parseInt(channelData.statistics.subscriberCount),
                    viewCount: parseInt(channelData.statistics.viewCount),
                    publishedAt: channelData.snippet.publishedAt,
                    videoCount: parseInt(channelData.statistics.videoCount),
                    hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                    commentCount: parseInt(channelData.statistics.commentCount),
                    topicIds: channelData.topicDetails?.topicIds || [],
                    topicCategories: channelData.topicDetails?.topicCategories || [],
                    keywords: channelData.brandingSettings?.channel?.keywords || ''
                  }),
                  channelGrowthMomentum: calculateChannelGrowthMomentum({
                    subscriberCount: parseInt(channelData.statistics.subscriberCount),
                    viewCount: parseInt(channelData.statistics.viewCount),
                    publishedAt: channelData.snippet.publishedAt,
                    videoCount: parseInt(channelData.statistics.videoCount),
                    hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                    commentCount: parseInt(channelData.statistics.commentCount),
                    topicIds: channelData.topicDetails?.topicIds || [],
                    topicCategories: channelData.topicDetails?.topicCategories || [],
                    keywords: channelData.brandingSettings?.channel?.keywords || ''
                  }),
                  contentSubscriberEfficiency: calculateContentSubscriberEfficiency({
                    subscriberCount: parseInt(channelData.statistics.subscriberCount),
                    viewCount: parseInt(channelData.statistics.viewCount),
                    publishedAt: channelData.snippet.publishedAt,
                    videoCount: parseInt(channelData.statistics.videoCount),
                    hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                    commentCount: parseInt(channelData.statistics.commentCount),
                    topicIds: channelData.topicDetails?.topicIds || [],
                    topicCategories: channelData.topicDetails?.topicCategories || [],
                    keywords: channelData.brandingSettings?.channel?.keywords || ''
                  }),
                };
                
                // Add channel efficiency index
                metrics.channelEfficiencyIndex = calculateChannelEfficiencyIndex({
                  subscriberCount: parseInt(channelData.statistics.subscriberCount),
                  viewCount: parseInt(channelData.statistics.viewCount),
                  publishedAt: channelData.snippet.publishedAt,
                  videoCount: parseInt(channelData.statistics.videoCount),
                  hiddenSubscriberCount: channelData.statistics.hiddenSubscriberCount,
                  commentCount: parseInt(channelData.statistics.commentCount),
                  topicIds: channelData.topicDetails?.topicIds || [],
                  topicCategories: channelData.topicDetails?.topicCategories || [],
                  keywords: channelData.brandingSettings?.channel?.keywords || ''
                }, videoDetails);
                
                setChannelMetrics(metrics);
              } else {
                // No valid video IDs found
                setVideoData([]);
                setTopTags([]);
              }
            }
          } catch (err) {
            console.error('Error fetching video data:', err);
          }
          
          // Fetch other channels info
          setLoadingOtherChannels(true);
          try {
            const featuredChannelsData = await getFeaturedChannels(storedChannelId);
            if (featuredChannelsData.channels.length > 0) {
              // For each channel ID, fetch basic channel info
              const channelsDetails = await Promise.all(
                featuredChannelsData.channels.map(async (id: string) => {
                  try {
                    const response = await getChannelDetails(id);
                    if (response.items.length > 0) {
                      const channelInfo = response.items[0];
                      return {
                        id: channelInfo.id,
                        title: channelInfo.snippet?.title || 'Unknown Channel',
                        thumbnailUrl: channelInfo.snippet?.thumbnails?.default?.url || null,
                        subscriberCount: channelInfo.statistics?.subscriberCount || '0'
                      };
                    }
                    return null;
                  } catch (err) {
                    console.error(`Error fetching data for channel ${id}:`, err);
                    return null;
                  }
                })
              );
              
              // Filter out any null results
              const validChannelsDetails = channelsDetails.filter(Boolean);
              setOtherChannels(validChannelsDetails);
            }
          } catch (err) {
            console.error('Error fetching other channels:', err);
          } finally {
            setLoadingOtherChannels(false);
          }
          
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
  
  const handleSelectOtherChannel = (otherChannelId: string) => {
    localStorage.setItem('selectedChannelId', otherChannelId);
    window.location.reload();
  };

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
  const formattedPublishedAt = publishedAt ? formatDateLong(publishedAt) : 'N/A';
  
  const commentCount = channelData.statistics?.commentCount;
  const hiddenSubscriberCount = channelData.statistics?.hiddenSubscriberCount;
  const topicIds = channelData.topicDetails?.topicIds || [];
  const topicCategories = channelData.topicDetails?.topicCategories || [];
  const channelKeywords = channelData.brandingSettings?.channel?.keywords || '';


  // Render the appropriate dashboard component
  const renderDashboard = () => {
    return (
      <>
        {/* Add Tabs for switching between different dashboard views */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'videos' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video size={16} />
              Latest Videos
            </button>
            
            <button 
              onClick={() => setActiveTab('graphs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'graphs' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart4 size={16} />
              Analytics Graphs
            </button>
          </div>
        </div>
        
        {activeTab === 'videos' && <LatestVideos />}
        {activeTab === 'graphs' && <ChannelGraphs videoData={videoData} channelMetrics={channelMetrics} />}
      </>
    );
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
                    
                    {/* Channel Rating Badge */}
                    {channelMetrics && Object.keys(channelMetrics).length > 0 && (
                      <div 
                        className="absolute -top-1 -right-1 w-12 h-12 flex items-center justify-center z-10 cursor-pointer"
                        data-tooltip-id="channelRating"
                        data-tooltip-content={`${calculateChannelRating(channelMetrics).description}. This rating is based on multiple channel metrics including subscriber conversion, audience retention, growth momentum, and content efficiency.`}
                        data-tooltip-title="Channel Performance Rating"
                      >
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center shadow-lg border-2 border-white font-bold text-base transition-transform hover:scale-105"
                          style={{ 
                            backgroundColor: calculateChannelRating(channelMetrics).color,
                          }}
                        >
                          <span className="text-white">{calculateChannelRating(channelMetrics).rating}</span>
                        </div>
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
                  
                  {/* Other Channels Section */}
                  {otherChannels.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                        <h2 className="text-sm font-semibold text-gray-800">Other Channels</h2>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        {otherChannels.map((channel, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                            onClick={() => handleSelectOtherChannel(channel.id)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full overflow-hidden">
                              {channel.thumbnailUrl ? (
                                <img 
                                  src={channel.thumbnailUrl} 
                                  alt={channel.title}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                  <UsersIcon size={12} className="text-purple-500" />
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-medium text-gray-900 truncate">{channel.title}</div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-500">
                                  {parseInt(channel.subscriberCount).toLocaleString()} subscribers
                                </span>
                                <ExternalLink size={8} className="text-purple-500" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {loadingOtherChannels && (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Middle column: Stats and description */}
              <motion.div 
                className="md:col-span-9"
                variants={fadeIn}
              >
                {/* Channel Metrics Marquee */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                    <h2 className="text-base font-semibold text-gray-800">Channel Metrics</h2>
                  </div>
                  
                  <div className="relative bg-gradient-to-tr from-gray-50 to-white rounded-lg border border-gray-100 shadow-md p-2">
                    {/* First row of marquee */}
                    <div className="marquee-container overflow-hidden" data-tooltip-position="bottom">
                      <div className="animate-marquee-pausable whitespace-nowrap flex flex-nowrap gap-3 py-1">
                        {/* First row metrics */}
                        
                        {/* Subscribers */}
                        <div 
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="subscribers"
                          data-tooltip-content="The total number of subscribers to your channel. This is a key growth indicator and measures your channel's ability to build a loyal audience."
                          data-tooltip-title="Subscribers"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                              <Users size={14} />
                            </div>
                            <span className="text-xs text-gray-500">Subscribers</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {hiddenSubscriberCount ? 'Hidden' : (subscriberCount ? formatNumber(subscriberCount) : 'N/A')}
                          </div>
                        </div>
                        
                        {/* Total Views */}
                        <div 
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="totalViews"
                          data-tooltip-content="The cumulative number of views across all your videos. This represents your channel's overall reach and visibility on the platform."
                          data-tooltip-title="Total Views"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <Eye size={14} />
                            </div>
                            <span className="text-xs text-gray-500">Total Views</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {viewCount ? formatNumber(viewCount) : 'N/A'}
                          </div>
                        </div>
                        
                        {/* Videos */}
                        <div 
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="videos"
                          data-tooltip-content="The total number of videos uploaded to your channel. This indicates your content production volume and consistency over time."
                          data-tooltip-title="Videos"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                              <Video size={14} />
                            </div>
                            <span className="text-xs text-gray-500">Videos</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {videoCount ? formatNumber(videoCount) : 'N/A'}
                          </div>
                        </div>
                        
                        {/* Created On */}
                        <div 
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="createdOn"
                          data-tooltip-content="When your channel was created. A longer history on the platform can indicate more established presence and audience relationships."
                          data-tooltip-title="Channel Age"
                        >
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
                        
                        {/* Avg. Views per Video */}
                        <div
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="avgViews"
                          data-tooltip-content="Total views divided by number of videos, indicating the typical performance of your content and helping identify if your channel has consistent audience reach."
                          data-tooltip-title="Average Views per Video"
                        >
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
                        
                        {/* Engagement Rate */}
                        <div
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="engagementRate"
                          data-tooltip-content="Average views per video divided by subscriber count, showing what percentage of subscribers watch each video on average."
                          data-tooltip-title="Engagement Rate"
                        >
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
                        </div>

                        {/* Duplicate the first row metrics for infinite scrolling */}
                        {/* Subscribers (duplicate) */}
                        <div 
                          className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                          data-tooltip-id="subscribersDup"
                          data-tooltip-content="The total number of subscribers to your channel. This is a key growth indicator and measures your channel's ability to build a loyal audience."
                          data-tooltip-title="Subscribers"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                              <Users size={14} />
                            </div>
                            <span className="text-xs text-gray-500">Subscribers</span>
                          </div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {hiddenSubscriberCount ? 'Hidden' : (subscriberCount ? formatNumber(subscriberCount) : 'N/A')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Second row of marquee */}
                    <div className="marquee-container overflow-hidden" data-tooltip-position="top">
                      <div className="animate-marquee-pausable whitespace-nowrap flex flex-nowrap gap-3 py-1">
                        {/* Second row - advanced metrics */}
                        
                        {/* Subscriber Conversion Rate */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="conversionRate"
                            data-tooltip-content="Indicates how many subscribers you gain per 1,000 views. Higher values suggest your content is effective at converting viewers into long-term followers."
                            data-tooltip-title="Subscriber Conversion Rate"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                                <Award size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Sub. Conversion Rate</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {channelMetrics.subscriberConversionRate.toFixed(2)} per 1K views
                            </div>
                          </div>
                        )}
                        
                        {/* Channel Activity Ratio */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="activityRatio"
                            data-tooltip-content="Measures how frequently you post new content. Higher values indicate more consistent content creation, which typically correlates with channel growth."
                            data-tooltip-title="Channel Activity Ratio"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Activity size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Activity Ratio</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {channelMetrics.channelActivityRatio.toFixed(2)} videos/day
                            </div>
                          </div>
                        )}
                        
                        {/* Channel Efficiency Index */}
                        {channelMetrics.channelEfficiencyIndex !== undefined && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="efficiencyIndex"
                            data-tooltip-content="Assesses how efficiently your channel converts content production into both views and engagement. Helps identify if quality or quantity is driving your channel's success."
                            data-tooltip-title="Channel Efficiency Index"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                                <Gauge size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Efficiency Index</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {channelMetrics.channelEfficiencyIndex.toFixed(2)}
                            </div>
                          </div>
                        )}
                        
                        {/* Audience Retention Strength */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="retentionStrength"
                            data-tooltip-content="Measures how well your videos retain your subscriber base while accounting for content volume. Higher values indicate stronger audience loyalty."
                            data-tooltip-title="Audience Retention Strength"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <Repeat size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Retention Strength</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {channelMetrics.audienceRetentionStrength.toFixed(2)}
                            </div>
                          </div>
                        )}
                        
                        {/* Channel Growth Momentum */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="growthMomentum"
                            data-tooltip-content="Measures your channel's growth rate while accounting for content production. Higher values indicate faster growth relative to your channel's age and output."
                            data-tooltip-title="Channel Growth Momentum"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                <TrendingUpIcon size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Growth Momentum</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {formatNumber(channelMetrics.channelGrowthMomentum.toFixed(2))}
                            </div>
                          </div>
                        )}
                        
                        {/* Content-Subscriber Efficiency */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="subsPerVideo"
                            data-tooltip-content="Shows how many subscribers you gain per video published. Higher values suggest each piece of content efficiently attracts new followers."
                            data-tooltip-title="Content-Subscriber Efficiency"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                                <Layers size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Subs per Video</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {formatNumber(channelMetrics.contentSubscriberEfficiency.toFixed(2))}
                            </div>
                          </div>
                        )}

                        {/* Subscriber Conversion Rate (duplicate) */}
                        {Object.keys(channelMetrics).length > 0 && (
                          <div 
                            className="inline-block flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1 relative min-w-[180px]"
                            data-tooltip-id="conversionRateDup"
                            data-tooltip-content="Indicates how many subscribers you gain per 1,000 views. Higher values suggest your content is effective at converting viewers into long-term followers."
                            data-tooltip-title="Subscriber Conversion Rate"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                                <Award size={14} />
                              </div>
                              <span className="text-xs text-gray-500">Sub. Conversion Rate</span>
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {channelMetrics.subscriberConversionRate.toFixed(2)} per 1K views
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tooltip Portal */}
                    {tooltipState.active && (
                      <div 
                        ref={tooltipContainerRef}
                        className="fixed bg-gray-50 text-gray-700 text-xs rounded-md p-3 shadow-xl z-[9999] pointer-events-none border border-gray-200 w-64 transition-opacity duration-100"
                        style={{
                          left: `${tooltipState.x}px`,
                          top: tooltipState.isTop ? `${tooltipState.y - 10}px` : 'auto',
                          bottom: !tooltipState.isTop ? `calc(100vh - ${tooltipState.y}px - 10px)` : 'auto',
                          transform: 'translateX(-50%)',
                          opacity: tooltipState.active ? 1 : 0
                        }}
                      >
                        <p className="font-medium text-gray-800 mb-1">
                          {tooltipState.title}
                        </p>
                        <p>
                          {tooltipState.content}
                        </p>
                      </div>
                    )}
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
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 mb-3justify-between">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800">Latest Videos</h2>
          </div>
          
          {renderDashboard()}
        </motion.div>
      </motion.div>
    </div>
  );
}