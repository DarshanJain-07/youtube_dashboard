import React, { useState, useEffect } from 'react';
import { getChannelInfo } from '../services/youtubeApi';

interface ChannelsProps {
  channelId: string;
}

const Channels: React.FC<ChannelsProps> = ({ channelId }) => {
  const [channelInfo, setChannelInfo] = useState<{
    publishedAt: string;
    viewCount: number;
    commentCount: number;
    subscriberCount: number;
    hiddenSubscriberCount: boolean;
    videoCount: number;
    topicIds: string[];
    topicCategories: string[];
    keywords: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setLoading(true);
        const data = await getChannelInfo(channelId);
        setChannelInfo(data);
      } catch (err) {
        setError('Failed to fetch channel information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelInfo();
  }, [channelId]);

  if (loading) return <div>Loading channel information...</div>;
  if (error) return <div>{error}</div>;
  if (!channelInfo) return <div>No channel information found</div>;

  return (
    <div className="channel-details">
      <h2>Channel Information</h2>
      <div className="channel-stats">
        <p><strong>Published At:</strong> {channelInfo.publishedAt}</p>
        <p><strong>View Count:</strong> {channelInfo.viewCount.toLocaleString()}</p>
        <p><strong>Comment Count:</strong> {channelInfo.commentCount.toLocaleString()}</p>
        <p>
          <strong>Subscriber Count:</strong> 
          {channelInfo.hiddenSubscriberCount 
            ? 'Hidden' 
            : channelInfo.subscriberCount.toLocaleString()}
        </p>
        <p><strong>Video Count:</strong> {channelInfo.videoCount.toLocaleString()}</p>
        
        <div className="channel-topics">
          <h3>Topics</h3>
          <p><strong>Topic IDs:</strong> {channelInfo.topicIds.join(', ') || 'N/A'}</p>
          <p><strong>Topic Categories:</strong> {channelInfo.topicCategories.join(', ') || 'N/A'}</p>
        </div>

        <div className="channel-keywords">
          <h3>Keywords</h3>
          <p>{channelInfo.keywords || 'No keywords found'}</p>
        </div>
      </div>
    </div>
  );
};

export default Channels;