// services/youtubeApi.ts

/**
 * YouTube API Service
 * A collection of functions to interact with the YouTube Data API v3
 */

// Base URL for YouTube API
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeApiParams {
  [key: string]: string | number | undefined;
}

/**
 * Generic function to fetch data from YouTube API
 * @param {string} endpoint - API endpoint (e.g., 'search', 'channels', 'videos')
 * @param {YouTubeApiParams} params - Query parameters for the API call
 * @returns {Promise<any>} API response data
 */
export async function fetchFromYouTube(endpoint: string, params: YouTubeApiParams = {}) {
  // Add API key to params
  const queryParams = {
    ...params,
    key: process.env.YOUTUBE_API_KEY,
  };

  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `YouTube API Error: ${errorData.error?.message || response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    throw error;
  }
}

/**
 * Search for YouTube channels
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<Object>} Search results
 */
export async function searchChannels(query: string, maxResults: number = 10) {
  return fetchFromYouTube('search', {
    part: 'snippet',
    q: query,
    type: 'channel',
    maxResults,
  });
}

/**
 * Get channel details by channel ID
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} Channel details
 */
export async function getChannelDetails(channelId: string) {
  return fetchFromYouTube('channels', {
    part: 'snippet,statistics,contentDetails,brandingSettings',
    id: channelId,
  });
}

/**
 * Get videos from a specific channel
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum number of results (default: 50)
 * @param {string} pageToken - Token for pagination
 * @returns {Promise<Object>} List of channel videos
 */
export async function getChannelVideos(channelId: string, maxResults: number = 50, pageToken: string = '') {
  return fetchFromYouTube('search', {
    part: 'snippet',
    channelId,
    maxResults,
    order: 'date',
    type: 'video',
    pageToken: pageToken || undefined,
  });
}

/**
 * Get detailed video information
 * @param {string|string[]} videoIds - Single video ID or array of video IDs
 * @returns {Promise<Object>} Video details
 */
export async function getVideoDetails(videoIds: string | string[]) {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
  
  return fetchFromYouTube('videos', {
    part: 'snippet,statistics,contentDetails',
    id: ids,
  });
}

/**
 * Get video comments
 * @param {string} videoId - YouTube video ID
 * @param {number} maxResults - Maximum number of comments (default: 100)
 * @param {string} pageToken - Token for pagination
 * @returns {Promise<Object>} Video comments
 */
export async function getVideoComments(videoId: string, maxResults: number = 100, pageToken: string = '') {
  return fetchFromYouTube('commentThreads', {
    part: 'snippet,replies',
    videoId,
    maxResults,
    order: 'relevance',
    pageToken: pageToken || undefined,
  });
}

/**
 * Get channel uploads playlist ID (All uploaded videos)
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<string>} Uploads playlist ID
 */
export async function getUploadsPlaylistId(channelId: string): Promise<string> {
  const response = await getChannelDetails(channelId);
  return response.items[0]?.contentDetails?.relatedPlaylists?.uploads || '';
}

/**
 * Get all videos from a playlist (useful for channel uploads)
 * @param {string} playlistId - YouTube playlist ID
 * @param {number} maxResults - Maximum results per page (default: 50)
 * @param {string} pageToken - Token for pagination
 * @returns {Promise<Object>} Playlist items
 */
export async function getPlaylistItems(playlistId: string, maxResults: number = 50, pageToken: string = '') {
  return fetchFromYouTube('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults,
    pageToken: pageToken || undefined,
  });
}

/**
 * Get all videos from a channel with pagination handling
 * @param {string} channelId - YouTube channel ID
 * @param {number} limit - Maximum total videos to fetch (default: 200)
 * @returns {Promise<Array>} Array of video items
 */
export async function getAllChannelVideos(channelId: string, limit: number = 200) {
  const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
  if (!uploadsPlaylistId) {
    throw new Error('Could not retrieve channel uploads playlist');
  }
  
  let videos: any[] = [];
  let nextPageToken = '';
  
  do {
    const response = await getPlaylistItems(uploadsPlaylistId, 50, nextPageToken);
    videos = [...videos, ...response.items];
    nextPageToken = response.nextPageToken || '';
    
    if (videos.length >= limit || !nextPageToken) {
      break;
    }
  } while (nextPageToken);
  
  return videos.slice(0, limit);
}

/**
 * Get channel analytics data (combines multiple API calls)
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<any>} Comprehensive channel data
 */
export async function getChannelAnalytics(channelId: string) {
  try {
    // Get basic channel info
    const channelData = await getChannelDetails(channelId);
    const channel = channelData.items[0];
    
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    // Get videos (limited to 50 most recent)
    const videos = await getAllChannelVideos(channelId, 50);
    
    // Extract video IDs for detailed info
    const videoIds = videos.map(video => video.contentDetails.videoId);
    
    // Get detailed video data
    const videoDetailsResponse = await getVideoDetails(videoIds);
    const videoDetails = videoDetailsResponse.items;
    
    // Calculate additional metrics
    const totalViews = videoDetails.reduce((sum: number, video: any) => 
      sum + parseInt(video.statistics.viewCount || '0'), 0);
    
    const averageViews = videoDetails.length > 0 ? totalViews / videoDetails.length : 0;
    
    const videoLengths = videoDetails.map((video: any) => {
      const duration = video.contentDetails.duration;
      // Convert ISO 8601 duration to seconds
      return parseDuration(duration);
    });
    
    const averageLength = videoLengths.length > 0 ? 
      videoLengths.reduce((sum: number, length: number) => sum + length, 0) / videoLengths.length : 0;
    
    // Return compiled analytics data
    return {
      channelInfo: channel,
      statistics: {
        totalVideos: channel.statistics.videoCount,
        totalViews: channel.statistics.viewCount,
        subscribers: channel.statistics.subscriberCount,
        averageViews,
        averageVideoLength: averageLength,
      },
      recentVideos: videoDetails,
    };
  } catch (error) {
    console.error('Error getting channel analytics:', error);
    throw error;
  }
}

/**
 * Helper function to parse ISO 8601 duration to seconds
 * @param {string} duration - ISO 8601 duration string (e.g., PT1H30M15S)
 * @returns {number} Duration in seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Compare multiple channels
 * @param {string[]} channelIds - Array of channel IDs to compare
 * @returns {Promise<Object>} Comparison data for all channels
 */
export async function compareChannels(channelIds: string[]) {
  try {
    const channelPromises = channelIds.map(id => getChannelAnalytics(id));
    const channelsData = await Promise.all(channelPromises);
    
    return {
      channels: channelsData,
      comparativeMetrics: generateComparativeMetrics(channelsData),
    };
  } catch (error) {
    console.error('Error comparing channels:', error);
    throw error;
  }
}

/**
 * Generate comparative metrics between channels
 * @param {Array} channelsData - Array of channel analytics data
 * @returns {Object} Comparative metrics
 */
function generateComparativeMetrics(channelsData: any[]) {
  // Calculate growth rates, engagement ratios, etc.
  return {
    subscriberRanking: channelsData
      .map(data => ({
        id: data.channelInfo.id,
        name: data.channelInfo.snippet.title,
        subscribers: parseInt(data.channelInfo.statistics.subscriberCount)
      }))
      .sort((a, b) => b.subscribers - a.subscribers),
    
    viewsRanking: channelsData
      .map(data => ({
        id: data.channelInfo.id,
        name: data.channelInfo.snippet.title,
        views: parseInt(data.channelInfo.statistics.viewCount)
      }))
      .sort((a, b) => b.views - a.views),
    
    engagementRanking: channelsData
      .map(data => {
        const subscribers = parseInt(data.channelInfo.statistics.subscriberCount);
        const views = parseInt(data.channelInfo.statistics.viewCount);
        const videos = parseInt(data.channelInfo.statistics.videoCount);
        
        // Views per subscriber ratio
        const viewsPerSubscriber = subscribers > 0 ? views / subscribers : 0;
        
        return {
          id: data.channelInfo.id,
          name: data.channelInfo.snippet.title,
          viewsPerSubscriber,
          viewsPerVideo: videos > 0 ? views / videos : 0,
        };
      })
      .sort((a, b) => b.viewsPerSubscriber - a.viewsPerSubscriber),
  };
}