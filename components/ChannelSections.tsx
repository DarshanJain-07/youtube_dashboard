import React, { useState, useEffect } from 'react';
import { getFeaturedChannels } from '../services/youtubeApi';

interface ChannelSectionsProps {
  channelId: string;
}

const ChannelSections: React.FC<ChannelSectionsProps> = ({ channelId }) => {
  const [featuredChannels, setFeaturedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedChannels = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedChannels(channelId);
        setFeaturedChannels(data.channels);
      } catch (err) {
        setError('Failed to fetch featured channels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedChannels();
  }, [channelId]);

  if (loading) return <div>Loading featured channels...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="channel-sections">
      <h2>Featured Channels</h2>
      {featuredChannels.length === 0 ? (
        <p>No featured channels found</p>
      ) : (
        <div className="featured-channels-list">
          <h3>Channel IDs:</h3>
          <ul>
            {featuredChannels.map((channelId, index) => (
              <li key={index}>
                <a 
                  href={`https://www.youtube.com/channel/${channelId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {channelId}
                </a>
              </li>
            ))}
          </ul>
          <p>Total Featured Channels: {featuredChannels.length}</p>
        </div>
      )}
    </div>
  );
};

export default ChannelSections;