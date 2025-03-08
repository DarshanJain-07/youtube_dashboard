import React, { useState, useEffect } from 'react';
import { getChannelVideos } from '../services/youtubeApi';

interface SearchProps {
  channelId: string;
  maxResults?: number;
}

const Search: React.FC<SearchProps> = ({ channelId, maxResults = 20 }) => {
  const [searchResults, setSearchResults] = useState<{
    id: { videoId?: string };
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelVideos = async () => {
      try {
        setLoading(true);
        const response = await getChannelVideos(channelId, maxResults);
        setSearchResults(response.items);
      } catch (err) {
        setError('Failed to fetch channel videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelVideos();
  }, [channelId, maxResults]);

  if (loading) return <div>Loading videos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="search-results">
      <h2>Channel Videos</h2>
      {searchResults.length === 0 ? (
        <p>No videos found</p>
      ) : (
        <div className="videos-grid">
          {searchResults.map((result, index) => {
            const videoId = result.id.videoId;
            return videoId ? (
              <div key={index} className="video-card">
                <iframe
                  title={`YouTube Video ${index}`}
                  width="300"
                  height="200"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allowFullScreen
                />
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default Search;