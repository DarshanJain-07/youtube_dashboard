// components/LatestVideos.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivities, getFormattedVideoData } from '../services/youtubeApi';
import { formatNumber } from './utils';
import { X } from 'lucide-react';

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

interface LatestVideosProps {
  channelId: string;
}

const ChannelActivity: React.FC<LatestVideosProps> = ({ channelId }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        
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

  // Format date to more readable form
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openVideoDialog = (video: VideoData) => {
    setSelectedVideo(video);
    // Disable body scroll when dialog is open
    document.body.style.overflow = 'hidden';
  };

  const closeVideoDialog = () => {
    setSelectedVideo(null);
    // Re-enable body scroll when dialog is closed
    document.body.style.overflow = 'auto';
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
      
      {/* Thumbnail Grid */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openVideoDialog(video)}
            className="cursor-pointer relative overflow-hidden rounded-lg shadow-md"
          >
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-full aspect-video object-cover"
            />
            
            {/* Hover overlay with title */}
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <p className="text-white text-sm font-medium line-clamp-2">{video.title}</p>
            </motion.div>

            {/* Sponsored badge if applicable */}
            {video.hasPaidProductPlacement && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                Sponsored
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {videos.length === 0 && !loading && !error && (
        <div className="text-center text-gray-500 py-10">
          No videos found for this channel.
        </div>
      )}

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
              className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative shadow-2xl border border-gray-100"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Hide scrollbar for Chrome, Safari and Opera */}
              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {/* Gradient accent */}
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

                {/* Video Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">Video Statistics</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><span className="font-medium">Published:</span> {formatDate(selectedVideo.publishedAt)}</li>
                      <li><span className="font-medium">Views:</span> {formatNumber(selectedVideo.viewCount)}</li>
                      <li><span className="font-medium">Likes:</span> {formatNumber(selectedVideo.likeCount)}</li>
                      <li><span className="font-medium">Comments:</span> {formatNumber(selectedVideo.commentCount)}</li>
                      <li><span className="font-medium">Favorites:</span> {formatNumber(selectedVideo.favoriteCount)}</li>
                      <li><span className="font-medium">Category ID:</span> {selectedVideo.categoryId}</li>
                      <li><span className="font-medium">Sponsored Content:</span> {selectedVideo.hasPaidProductPlacement ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">Topic Categories</h4>
                    {selectedVideo.topicCategories.length > 0 ? (
                      <ul className="space-y-1 text-gray-700 break-words">
                        {selectedVideo.topicCategories.map((topic, index) => (
                          <li key={index} className="break-words text-sm">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No topic categories available</p>
                    )}
                  </div>
                </div>

                {/* Video Description */}
                <div className="mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">Description</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedVideo.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">Tags ({selectedVideo.tags.length})</h4>
                  {selectedVideo.tags.length > 0 ? (
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
                  ) : (
                    <p className="text-gray-600">No tags available</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChannelActivity;