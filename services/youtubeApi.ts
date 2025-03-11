// YouTubeAPI.ts

// Base URL for YouTube API
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// API Base response type
export interface YouTubeApiResponse {
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

// ACTIVITIES endpoint
export interface ActivitySnippet {
  title: string;
  description?: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
  type: 'upload';
}

export interface ActivityContentDetails {
  upload?: {
    videoId: string;
  };
}

export interface Activity {
  kind: string;
  etag: string;
  id: string;
  snippet: ActivitySnippet;
  contentDetails: ActivityContentDetails;
}

export interface ActivitiesResponse extends YouTubeApiResponse {
  items: Activity[];
}

export interface FormattedActivity {
  title: string;
  thumbnailUrl: string;
  videoId: string;
}

// CHANNELS endpoint
export interface ChannelSnippet {
  publishedAt: string; // ISO 8601 date
  title: string;
  description: string;
  customUrl?: string;
  thumbnails: {
    [size: string]: {
      url: string;
      width: number;
      height: number;
    };
  };
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  country?: string;
}

export interface ChannelStatistics {
  viewCount: string; // Will be parsed as number
  subscriberCount: string; // Will be parsed as number
  hiddenSubscriberCount: boolean;
  videoCount: string; // Will be parsed as number
  commentCount: string; // Will be parsed as number
}

export interface ChannelTopicDetails {
  topicIds?: string[];
  topicCategories?: string[];
}

export interface ChannelBrandingSettings {
  channel: {
    keywords: string;
    title?: string;
    description?: string;
    showRelatedChannels?: boolean;
    unsubscribedTrailer?: string;
    // Other channel fields still included
  };
  image?: {
    bannerExternalUrl?: string;
  };
}

export interface Channel {
  kind: string;
  etag: string;
  id: string;
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
  topicDetails?: ChannelTopicDetails;
  brandingSettings?: ChannelBrandingSettings;
}

export interface ChannelsResponse extends YouTubeApiResponse {
  items: Channel[];
}

export interface FormattedChannelInfo {
  publishedAt: string; // Converted to human-readable format
  viewCount: number;
  commentCount: number;
  subscriberCount: number;
  hiddenSubscriberCount: boolean;
  videoCount: number;
  topicIds: string[];
  topicCategories: string[];
  keywords: string;
}

// CHANNEL SECTIONS endpoint
export interface ChannelSectionContentDetails {
  channels?: string[];
  playlists?: string[];
}

export interface ChannelSection {
  kind: string;
  etag: string;
  id: string;
  contentDetails: ChannelSectionContentDetails;
}

export interface ChannelSectionsResponse extends YouTubeApiResponse {
  items: ChannelSection[];
}

export interface FeaturedChannels {
  channels: string[];
}

// SEARCH endpoint
export interface SearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet?: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      [size: string]: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    liveBroadcastContent: string;
  };
}

export interface SearchResponse extends YouTubeApiResponse {
  items: SearchResult[];
}

// VIDEOS endpoint
export interface VideoSnippet {
  publishedAt: string; // ISO 8601
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    [size: string]: {
      url: string;
      width: number;
      height: number;
    };
  };
  channelTitle: string;
  tags?: string[];
  categoryId: string;
  liveBroadcastContent: string;
  defaultLanguage?: string;
  localized?: {
    title: string;
    description: string;
  };
  defaultAudioLanguage?: string;
}

export interface VideoStatistics {
  viewCount: string; // Will be parsed as number
  likeCount: string; // Will be parsed as number
  dislikeCount?: string; // Will be parsed as number (not available anymore)
  favoriteCount: string; // Will be parsed as number
  commentCount: string; // Will be parsed as number
}

export interface VideoTopicDetails {
  topicCategories?: string[];
}

export interface VideoPaidProductPlacementDetails {
  hasPaidProductPlacement?: boolean;
}

export interface Video {
  kind: string;
  etag: string;
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStatistics;
  topicDetails?: VideoTopicDetails;
  paidProductPlacementDetails?: VideoPaidProductPlacementDetails;
}

export interface VideosResponse extends YouTubeApiResponse {
  items: Video[];
}

export interface FormattedVideoData {
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
}

// COMMENTS endpoint
export interface CommentSnippet {
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  authorChannelUrl?: string;
  authorChannelId?: {
    value: string;
  };
  textDisplay: string;
  textOriginal?: string;
  parentId?: string;
  canRate?: boolean;
  viewerRating?: string;
  likeCount: number;
  publishedAt: string;
  updatedAt?: string;
}

export interface Comment {
  kind: string;
  etag: string;
  id: string;
  snippet: CommentSnippet;
}

export interface CommentThreadSnippet {
  channelId?: string;
  videoId?: string;
  topLevelComment: Comment;
  canReply?: boolean;
  totalReplyCount: number;
  isPublic?: boolean;
}

export interface CommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet: CommentThreadSnippet;
  replies?: {
    comments: Comment[];
  };
}

export interface CommentThreadsResponse extends YouTubeApiResponse {
  items: CommentThread[];
}

export interface FormattedComment {
  id: string;
  authorName: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  replyCount: number;
}

export interface FormattedVideoComments {
  comments: FormattedComment[];
}

// Type for API parameters
export interface YouTubeApiParams {
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
 * Search for YouTube channels
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results (default: 10)
 * @returns {Promise<SearchResponse>} Search results
 */
export async function searchChannels(query: string, maxResults: number = 10): Promise<SearchResponse> {
  return fetchFromYouTube<SearchResponse>('search', {
    part: 'snippet',
    q: query,
    type: 'channel',
    maxResults,
  });
}

/**
 * Get channel activities (uploads)
 * @param {string} channelId - YouTube channel ID
 * @param {number} maxResults - Maximum number of results (default: 15)
 * @returns {Promise<FormattedActivity[]>} Channel activities
 */
export async function getActivities(channelId: string, maxResults: number = 15): Promise<FormattedActivity[]> {
  const response = await fetchFromYouTube<ActivitiesResponse>('activities', {
    part: 'snippet,contentDetails',
    channelId,
    maxResults
  });
  
  return response.items
    .filter(item => item.contentDetails.upload?.videoId)
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
    part: 'snippet,statistics,topicDetails,brandingSettings,contentDetails',
    id: channelId,
    maxResults: 15
  });
}

/**
 * Get formatted channel info with numeric values and formatted date
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<FormattedChannelInfo>} Formatted channel info
 */
export async function getChannelInfo(channelId: string): Promise<FormattedChannelInfo> {
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
 * @returns {Promise<FeaturedChannels>} List of featured channel IDs
 */
export async function getFeaturedChannels(channelId: string): Promise<FeaturedChannels> {
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
    maxResults,
    type: 'video',
    order: 'date'
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
 * @returns {Promise<FormattedVideoData[]>} Formatted video data
 */
export async function getFormattedVideoData(videoIds: string | string[]): Promise<FormattedVideoData[]> {
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
 * @returns {Promise<FormattedVideoComments>} Formatted video comments
 */
export async function getFormattedVideoComments(
  videoId: string, 
  maxResults: number = 100, 
  order: 'time' | 'relevance' = 'relevance'
): Promise<FormattedVideoComments> {
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