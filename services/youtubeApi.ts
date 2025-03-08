// services/youtubeApi.ts

// Base URL for YouTube API
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// API Key type
type APIKey = string;

// Base interface for all API responses
interface YouTubeApiResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
  prevPageToken?: string;
  items: any[];
}
// ---------------------------------------------------------------------------------------------------------
//  ACTIVITY
interface Activity {
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  contentDetails: {
    upload?: {
      videoId: string;
    };
  };
}

interface ActivitiesResponse extends YouTubeApiResponse {
  items: Activity[];
}

// ---------------------------------------------------------------------------------------------------------

// CHANNELS 
interface Channel {
  snippet: {
    publishedAt: string; // ISO 8601 format
  };
  statistics: {
    viewCount: string; // Will be parsed as number
    subscriberCount: string; // Will be parsed as number
    hiddenSubscriberCount: boolean;
    videoCount: string; // Will be parsed as number
    commentCount: string; // Will be parsed as number
  };
  topicDetails?: {
    topicIds?: string[];
    topicCategories?: string[];
  };
  brandingSettings?: {
    channel: {
      keywords: string;
    };
  };
}

interface ChannelsResponse extends YouTubeApiResponse {
  items: Channel[];
}

// ---------------------------------------------------------------------------------------------------------
// CHANNEL SECTION
interface ChannelSection {
  contentDetails: {
    channels: string[];
  };
}

interface ChannelSectionsResponse extends YouTubeApiResponse {
  items: ChannelSection[];
}

// ---------------------------------------------------------------------------------------------------------
// SEARCH endpoint types
interface SearchResult {
  id: {
    videoId?: string;
  };
}

interface SearchResponse extends YouTubeApiResponse {
  items: SearchResult[];
}

// ---------------------------------------------------------------------------------------------------------

// VIDEOS endpoint types
interface Video {
  id: string;
  snippet: {
    publishedAt: string; // ISO 8601
    description: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: {
    viewCount: string; // Will be parsed as number
    likeCount: string; // Will be parsed as number
    favoriteCount: string; // Will be parsed as number
    commentCount: string; // Will be parsed as number
  };
  topicDetails?: {
    topicCategories?: string[];
  };
  paidProductPlacementDetails?: {
    hasPaidProductPlacement?: boolean;
  };
}

interface VideosResponse extends YouTubeApiResponse {
  items: Video[];
}

// ---------------------------------------------------------------------------------------------------------
// COMMENTS endpoint types
interface CommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
      };
    };
    totalReplyCount: number;
  };
}

interface CommentThreadsResponse extends YouTubeApiResponse {
  items: CommentThread[];
}

// Type for API parameters
interface YouTubeApiParams {
  [key: string]: string | number | undefined;
}

/**
 * Generic function to fetch data from YouTube API
 * @param {string} endpoint - API endpoint (e.g., 'search', 'channels', 'videos')
 * @param {YouTubeApiParams} params - Query parameters for the API call
 * @returns {Promise<T>} API response data
 */
export async function fetchFromYouTube<T extends YouTubeApiResponse>(endpoint: string, params: YouTubeApiParams = {}): Promise<T> {
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
    
    return await response.json() as T;
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    throw error;
  }
}

/**
 * Get channel activities (uploads)
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum number of results (default: 15)
 * @returns {Promise<Object>} Channel activities
 */
export async function getActivities(channelId: string, maxResults: number = 15): Promise<{
  title: string;
  thumbnailUrl: string;
  videoId: string;
}[]> {
  const response = await fetchFromYouTube<ActivitiesResponse>('activities', {
    part: 'snippet,contentDetails',
    channelId,
    maxResults
  });
  
  return response.items
    .map(item => ({
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      videoId: item.contentDetails.upload?.videoId || ''
    }));
}

/**
 * Get channel details by channel ID
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<ChannelsResponse>} Channel details
 */
export async function getChannelDetails(channelId: string): Promise<ChannelsResponse> {
  return fetchFromYouTube<ChannelsResponse>('channels', {
    part: 'snippet,statistics,topicDetails,brandingSettings',
    id: channelId,
  });
}

/**
 * Get formatted channel info with numeric values and formatted date
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} Formatted channel info
 */
export async function getChannelInfo(channelId: string): Promise<{
  publishedAt: string; // Converted to human-readable format
  viewCount: number;
  commentCount: number;
  subscriberCount: number;
  hiddenSubscriberCount: boolean;
  videoCount: number;
  topicIds: string[];
  topicCategories: string[];
  keywords: string;
}> {
  const response = await getChannelDetails(channelId);
  
  if (response.items.length === 0) {
    throw new Error('Channel not found');
  }
  
  const channel = response.items[0];
  
  // Convert ISO date to human-readable format
  const date = new Date(channel.snippet.publishedAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return {
    publishedAt: formattedDate,
    viewCount: parseInt(channel.statistics.viewCount, 10),
    commentCount: parseInt(channel.statistics.commentCount, 10),
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10),
    hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount,
    videoCount: parseInt(channel.statistics.videoCount, 10),
    topicIds: channel.topicDetails?.topicIds || [],
    topicCategories: channel.topicDetails?.topicCategories || [],
    keywords: channel.brandingSettings?.channel.keywords || ''
  };
}

/**
 * Get channel sections by channel ID
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<ChannelSectionsResponse>} Channel sections
 */
export async function getChannelSections(channelId: string): Promise<ChannelSectionsResponse> {
  return fetchFromYouTube<ChannelSectionsResponse>('channelSections', {
    part: 'contentDetails',
    channelId
  });
}

/**
 * Get featured channels from a YouTuber's channel
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<string[]>} List of featured channel IDs
 */
export async function getFeaturedChannels(channelId: string): Promise<{
  channels: string[];
}> {
  const response = await getChannelSections(channelId);
  
  // Extract all channel IDs from channel sections
  const featuredChannels: string[] = [];
  response.items.forEach(item => {
    if (item.contentDetails && item.contentDetails.channels) {
      featuredChannels.push(...item.contentDetails.channels);
    }
  });
  
  return {
    channels: featuredChannels
  };
}

/**
 * Get videos from a specific channel
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum number of results (default: 20)
 * @returns {Promise<SearchResponse>} List of channel videos
 */
export async function getChannelVideos(channelId: string, maxResults: number = 20): Promise<SearchResponse> {
  return fetchFromYouTube<SearchResponse>('search', {
    part: 'snippet',
    channelId,
    maxResults
  });
}

/**
 * Get detailed video information
 * @param {string|string[]} videoIds - Single video ID or array of video IDs
 * @returns {Promise<VideosResponse>} Video details
 */
export async function getVideoDetails(videoIds: string | string[]): Promise<VideosResponse> {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
  
  return fetchFromYouTube<VideosResponse>('videos', {
    part: 'snippet,statistics,topicDetails,paidProductPlacementDetails',
    id: ids,
  });
}

/**
 * Get formatted video data
 * @param {string|string[]} videoIds - Single video ID or array of video IDs
 * @returns {Promise<Array>} Formatted video data
 */
export async function getFormattedVideoData(videoIds: string | string[]): Promise<{
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
}[]> {
  const response = await getVideoDetails(videoIds);
  
  return response.items.map(item => ({
    id: item.id,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
    tags: item.snippet.tags || [],
    categoryId: item.snippet.categoryId,
    viewCount: parseInt(item.statistics.viewCount, 10),
    likeCount: parseInt(item.statistics.likeCount, 10),
    favoriteCount: parseInt(item.statistics.favoriteCount, 10),
    commentCount: parseInt(item.statistics.commentCount, 10),
    topicCategories: item.topicDetails?.topicCategories || [],
    hasPaidProductPlacement: item.paidProductPlacementDetails?.hasPaidProductPlacement || false
  }));
}

/**
 * Get video comments
 * @param {string} videoId - YouTube video ID
 * @param {number} maxResults - Maximum number of comments (default: 100)
 * @param {string} order - Sort order ('time' or 'relevance')
 * @returns {Promise<CommentThreadsResponse>} Video comments
 */
export async function getVideoComments(
  videoId: string, 
  maxResults: number = 100,
  order: 'time' | 'relevance' = 'relevance'
): Promise<CommentThreadsResponse> {
  return fetchFromYouTube<CommentThreadsResponse>('commentThreads', {
    part: 'snippet',
    videoId,
    maxResults,
    order
  });
}

/**
 * Get formatted video comments
 * @param {string} videoId - YouTube video ID
 * @param {number} maxResults - Maximum number of comments (default: 100)
 * @param {string} order - Sort order ('time' or 'relevance')
 * @returns {Promise<Object>} Formatted video comments
 */
export async function getFormattedVideoComments(
  videoId: string, 
  maxResults: number = 100, 
  order: 'time' | 'relevance' = 'relevance'
): Promise<{
  comments: {
    id: string;
    authorName: string;
    text: string;
    likeCount: number;
    publishedAt: string;
    replyCount: number;
  }[];
}> {
  const response = await getVideoComments(videoId, maxResults, order);
  
  return {
    comments: response.items.map(item => ({
      id: item.id,
      authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      replyCount: item.snippet.totalReplyCount
    }))
  };
}