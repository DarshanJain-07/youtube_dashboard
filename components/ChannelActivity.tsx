// components/LatestVideos.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivities, getFormattedVideoData, getVideoComments, getChannelInfo } from '../services/youtubeApi';
import { 
  formatNumber, 
  formatDateWithTime, 
  calculateEngagementRatio, 
  calculateEngagementDepthScore, 
  calculateViewToSubRatio, 
  calculateVideoEfficiencyIndex, 
  calculateDailyEngagementDensity, 
  calculateAudienceInteractionRatio 
} from './utils';
import { FormattedChannelInfo } from './types';
import { X, MessageCircle, Info } from 'lucide-react';

interface VideoData {
  id: string;
  publishedAt: string;
  description: string;
  tags: string[];
  categoryId: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  topicCategories: string[];
  hasPaidProductPlacement: boolean;
  title: string;
  thumbnailUrl: string;
}

interface CommentData {
  id: string;
  authorName: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  replyCount: number;
}

interface LatestVideosProps {
  channelId: string;
}

// Animation variants for consistent styling with page.tsx
const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  },
  cardItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      } 
    }
  }
};

const ChannelActivity: React.FC<LatestVideosProps> = ({ channelId }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentSortOrder, setCommentSortOrder] = useState<'time' | 'relevance'>('relevance');
  const [channelInfo, setChannelInfo] = useState<FormattedChannelInfo | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Handle tooltip display
  const handleTooltipToggle = (metricName: string | null) => {
    setShowTooltip(metricName === showTooltip ? null : metricName);
  };

  // Tooltip content mapping
  const tooltipContent = {
    engagementRatio: "Measures the percentage of viewers who actively engaged with your content through likes or comments. Higher values indicate more engaging content that encourages viewer interaction.",
    engagementDepthScore: "Weighted engagement metric that values comments (which require more effort) higher than likes. Helps identify content that drives meaningful audience interaction beyond passive watching.",
    viewToSubRatio: "Shows what percentage of your subscribers watched this video. Values above 100% indicate the video reached beyond your subscriber base, suggesting good discoverability or shareability.",
    videoEfficiencyIndex: "Compares this video's daily view rate to your channel's historical average. Values above 1.0 indicate this video performs better than your typical content.",
    dailyEngagementDensity: "Measures how much engagement your video generates per day since publication. Useful for comparing videos of different ages on an equal basis.",
    audienceInteractionRatio: "Shows how many interactions you get per 1,000 subscribers. Helps you understand if your existing audience is actively engaging with specific content."
  };

  // Fix tooltip z-index to ensure they appear above other elements
  const tooltipStyles = {
    position: 'relative',
    zIndex: 30,
  } as React.CSSProperties;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
        // Fetch channel info for analytics metrics
        try {
          const channelData = await getChannelInfo(channelId);
          setChannelInfo(channelData);
        } catch (err) {
          console.error('Error fetching channel info:', err);
        }
        
        // Step 1: Get the latest 15 activities (uploads)
        const activities = await getActivities(channelId, 15);
        
        // Step 2: Extract video IDs from activities
        const videoIds = activities
          .filter(activity => activity.videoId)
          .map(activity => activity.videoId);
        
        if (videoIds.length === 0) {
          setError('No videos found for this channel');
          setLoading(false);
          return;
        }
        
        // Step 3: Get detailed data for each video
        const videoDetails = await getFormattedVideoData(videoIds);
        
        // Step 4: Combine activity data (for title and thumbnail) with video details
        const combinedData = videoDetails.map(videoDetail => {
          const matchingActivity = activities.find(
            activity => activity.videoId === videoDetail.id
          );
          
          return {
            ...videoDetail,
            title: matchingActivity?.title || 'Untitled',
            thumbnailUrl: matchingActivity?.thumbnailUrl || '',
          };
        });
        
        setVideos(combinedData);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [channelId]);

  const openVideoDialog = (video: VideoData) => {
    setSelectedVideo(video);
    // Disable body scroll when dialog is open
    document.body.style.overflow = 'hidden';
  };

  const closeVideoDialog = () => {
    setSelectedVideo(null);
    setShowComments(false);
    // Re-enable body scroll when dialog is closed
    document.body.style.overflow = 'auto';
  };
  
  const handleViewComments = async () => {
    if (!selectedVideo) return;
    
    // If comments are already shown, hide them and return
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setLoadingComments(true);
    setShowComments(true);
    
    try {
      const response = await getVideoComments(selectedVideo.id, 100, commentSortOrder);
      if (response.items && response.items.length > 0) {
        const formattedComments = response.items.map(item => ({
          id: item.id,
          authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
          replyCount: item.snippet.totalReplyCount
        }));
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleSortOrderChange = (order: 'time' | 'relevance') => {
    setCommentSortOrder(order);
    if (showComments && selectedVideo) {
      handleViewComments();
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Video Grid with improved styling */}
      <motion.div 
        variants={animations.staggerContainer}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <motion.div 
              key={video.id}
              variants={animations.cardItem}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openVideoDialog(video)}
              className="cursor-pointer relative overflow-hidden rounded-lg shadow-md border border-gray-200 group transition-all duration-300"
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* View count and date overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white">
                  <div className="flex justify-between">
                    <span>{formatNumber(video.viewCount)} views</span>
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
             
              {/* Sponsored badge if applicable */}
              {video.hasPaidProductPlacement && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Sponsored
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {videos.length === 0 && !loading && !error && (
          <div className="text-center text-gray-500 py-10">
            No videos found for this channel.
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Dialog for Video Details */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 overflow-hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVideoDialog}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative shadow-2xl border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Gradient accent - similar to page.tsx styling */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-40 blur-md transform -translate-y-1 translate-x-1"></div>

              {/* Video Header with Close Button */}
              <div className="relative flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 pr-2">{selectedVideo.title}</h3>
                <button 
                  onClick={closeVideoDialog}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Video Content */}
              <div className="relative p-4 pb-5">
                {/* Thumbnail */}
                <div className="mb-6 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
                  <img 
                    src={selectedVideo.thumbnailUrl} 
                    alt={selectedVideo.title} 
                    className="w-full aspect-video object-cover"
                  />
                </div>

                {/* Analytics Metrics - New Component */}
                {channelInfo && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">📊</span>
                        YouTube Analytics Metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">Engagement Ratio</h5>
                            <button 
                              onClick={() => handleTooltipToggle('engagementRatio')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {calculateEngagementRatio(selectedVideo).toFixed(2)}%
                          </p>
                          {showTooltip === 'engagementRatio' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.engagementRatio}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">Engagement Depth Score</h5>
                            <button 
                              onClick={() => handleTooltipToggle('engagementDepthScore')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {calculateEngagementDepthScore(selectedVideo).toFixed(2)}%
                          </p>
                          {showTooltip === 'engagementDepthScore' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.engagementDepthScore}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">View-to-Subscriber Ratio</h5>
                            <button 
                              onClick={() => handleTooltipToggle('viewToSubRatio')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {calculateViewToSubRatio(selectedVideo, channelInfo).toFixed(2)}%
                          </p>
                          {showTooltip === 'viewToSubRatio' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.viewToSubRatio}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">Video Efficiency Index</h5>
                            <button 
                              onClick={() => handleTooltipToggle('videoEfficiencyIndex')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {calculateVideoEfficiencyIndex(selectedVideo, channelInfo).toFixed(2)}
                          </p>
                          {showTooltip === 'videoEfficiencyIndex' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.videoEfficiencyIndex}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">Daily Engagement Density</h5>
                            <button 
                              onClick={() => handleTooltipToggle('dailyEngagementDensity')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {formatNumber(calculateDailyEngagementDensity(selectedVideo))}
                          </p>
                          {showTooltip === 'dailyEngagementDensity' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.dailyEngagementDensity}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium text-gray-700">Audience Interaction Ratio</h5>
                            <button 
                              onClick={() => handleTooltipToggle('audienceInteractionRatio')}
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {calculateAudienceInteractionRatio(selectedVideo, channelInfo).toFixed(2)}
                          </p>
                          {showTooltip === 'audienceInteractionRatio' && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600 border-l-2 border-blue-400" style={tooltipStyles}>
                              {tooltipContent.audienceInteractionRatio}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">📈</span>
                      Video Statistics
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Published:</span> 
                        <span className="text-gray-800">{formatDateWithTime(selectedVideo.publishedAt)}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Views:</span> 
                        <span className="text-blue-600 font-bold">{formatNumber(selectedVideo.viewCount)}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Likes:</span> 
                        <span className="text-blue-600 font-bold">{formatNumber(selectedVideo.likeCount)}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Comments:</span> 
                        <span className="text-blue-600 font-bold">{formatNumber(selectedVideo.commentCount)}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Favorites:</span> 
                        <span className="text-blue-600 font-bold">{formatNumber(selectedVideo.favoriteCount)}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Category ID:</span> 
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">{selectedVideo.categoryId}</span>
                      </li>
                      <li className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-600">Sponsored Content:</span> 
                        <span className={`px-2 py-1 rounded-md ${selectedVideo.hasPaidProductPlacement ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {selectedVideo.hasPaidProductPlacement ? 'Yes' : 'No'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">🏷️</span>
                      Topic Categories
                    </h4>
                    {selectedVideo.topicCategories.length > 0 ? (
                      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <ul className="space-y-2 text-gray-700 break-words">
                          {selectedVideo.topicCategories.map((topic, index) => (
                            <li key={index} className="break-words text-sm bg-gray-50 p-2 rounded-md border-l-2 border-blue-300">
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                        <p className="text-gray-600">No topic categories available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Description */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">📝</span>
                      Description
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-gray-700 whitespace-pre-line">{selectedVideo.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">#️⃣</span>
                      Tags ({selectedVideo.tags.length})
                    </h4>
                    {selectedVideo.tags.length > 0 ? (
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                          {selectedVideo.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full shadow-sm hover:shadow transition-all duration-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                        <p className="text-gray-600">No tags available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="mb-6">
                  <button
                    onClick={handleViewComments}
                    className={`flex items-center justify-center w-full gap-2 p-3 rounded-lg transition-all duration-300 ${
                      showComments 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100'
                    }`}
                  >
                    <MessageCircle size={18} />
                    <span>{showComments ? "Hide Comments" : "View Comments"}</span>
                    <span className={`${showComments ? 'bg-white/20' : 'bg-blue-200'} px-2 py-0.5 rounded-full text-xs`}>
                      {formatNumber(selectedVideo.commentCount)}
                    </span>
                  </button>
                </div>
                
                {/* Comments Section */}
                {showComments && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <span className="bg-blue-100 text-blue-700 p-1 mr-2 rounded">💬</span>
                          Comments
                        </h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSortOrderChange('relevance')}
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                              commentSortOrder === 'relevance' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            Relevance
                          </button>
                          <button 
                            onClick={() => handleSortOrderChange('time')}
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                              commentSortOrder === 'time' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            Newest
                          </button>
                        </div>
                      </div>
                      
                      {loadingComments ? (
                        <div className="flex justify-center py-10 bg-white rounded-lg">
                          <div className="animate-pulse flex space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      ) : comments.length > 0 ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto bg-white p-4 rounded-lg border border-gray-100 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                          {comments.map(comment => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium text-blue-700 flex items-center gap-1">
                                  <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                  </span>
                                  {comment.authorName}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  {formatDateWithTime(comment.publishedAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: comment.text }}></p>
                              <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
                                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                  </svg>
                                  {formatNumber(comment.likeCount)} likes
                                </span>
                                {comment.replyCount > 0 && (
                                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="15 10 20 15 15 20"></polyline>
                                      <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
                                    </svg>
                                    {formatNumber(comment.replyCount)} replies
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-100">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          No comments found for this video.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChannelActivity;