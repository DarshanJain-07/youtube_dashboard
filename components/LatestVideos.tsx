// components/LatestVideos.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivities, getFormattedVideoData } from '../services/youtubeApi';
import { formatNumber } from './utils';

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

const LatestVideos: React.FC<LatestVideosProps> = ({ channelId }) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
      
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeVideoDialog}
          >
            <motion.div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Video Header with Close Button */}
              <div className="flex justify-between items-start p-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h3>
                <button 
                  onClick={closeVideoDialog}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Video Content */}
              <div className="p-6">
                {/* Thumbnail */}
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img 
                    src={selectedVideo.thumbnailUrl} 
                    alt={selectedVideo.title} 
                    className="w-full aspect-video object-cover"
                  />
                </div>

                {/* Video Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
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

                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">Topic Categories</h4>
                    {selectedVideo.topicCategories.length > 0 ? (
                      <ul className="space-y-1 text-gray-700">
                        {selectedVideo.topicCategories.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No topic categories available</p>
                    )}
                  </div>
                </div>

                {/* Video Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
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
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
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

export default LatestVideos;