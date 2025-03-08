import React, { useState, useEffect } from 'react';
import { getFormattedVideoData } from '../services/youtubeApi';

interface VideosProps {
  videoIds: string | string[];
}

const Videos: React.FC<VideosProps> = ({ videoIds }) => {
  const [videoData, setVideoData] = useState<{
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
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const data = await getFormattedVideoData(videoIds);
        setVideoData(data);
      } catch (err) {
        setError('Failed to fetch video details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoIds]);

  if (loading) return <div>Loading video details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="videos-details">
      <h2>Video Information</h2>
      {videoData.map((video) => (
        <div key={video.id} className="video-info-card">
          <h3>Video ID: {video.id}</h3>
          <div className="video-stats">
            <p><strong>Published At:</strong> {new Date(video.publishedAt).toLocaleDateString()}</p>
            <p><strong>Category ID:</strong> {video.categoryId}</p>
            
            <div className="video-metrics">
              <h4>Metrics</h4>
              <p>Views: {video.viewCount.toLocaleString()}</p>
              <p>Likes: {video.likeCount.toLocaleString()}</p>
              <p>Favorites: {video.favoriteCount.toLocaleString()}</p>
              <p>Comments: {video.commentCount.toLocaleString()}</p>
            </div>

            <div className="video-description">
              <h4>Description</h4>
              <p>{video.description}</p>
            </div>

            {video.tags && video.tags.length > 0 && (
              <div className="video-tags">
                <h4>Tags</h4>
                <p>{video.tags.join(', ')}</p>
              </div>
            )}

            <div className="video-topics">
              <h4>Topics</h4>
              <p>Categories: {video.topicCategories.join(', ') || 'N/A'}</p>
              <p>
                Paid Product Placement: 
                {video.hasPaidProductPlacement ? ' Yes' : ' No'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Videos;