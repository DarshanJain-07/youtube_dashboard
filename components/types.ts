// ACTIVITIES endpoint - Updates
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

// Animation variants
export interface AnimationVariant {
  hidden: any;
  visible: any;
}

// Dashboard type definition
export type DashboardType = 'latestvideos';

// Channel metrics interface
export interface ChannelMetrics {
  subscriberConversionRate: number;
  channelActivityRatio: number;
  audienceRetentionStrength: number;
  channelGrowthMomentum: number;
  contentSubscriberEfficiency: number;
  channelEfficiencyIndex?: number;
}

// Tooltip state interface
export interface TooltipState {
  active: boolean;
  id: string | null;
  title: string;
  content: string;
  x: number;
  y: number;
  isTop: boolean;
}

export interface ActivityContentDetails {
  upload?: {
    videoId: string;
  };
}

// CHANNELS endpoint - Updates
export interface Channel {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string; // ISO 8601 date
    // Other snippet fields still included
  };
  statistics: {
    viewCount: string; // Will be parsed as number
    subscriberCount: string; // Will be parsed as number
    hiddenSubscriberCount: boolean;
    videoCount: string; // Will be parsed as number
    commentCount: string; // Will be parsed as number
  };
  topicDetails?: {
    topicIds?: string[]; // Made optional to match your implementation
    topicCategories?: string[]; // Made optional to match your implementation
  };
  brandingSettings?: {
    channel: {
      keywords: string;
      // Other channel fields still included
    };
    // Other brandingSettings fields still included
  };
}

// CHANNEL SECTIONS endpoint - Updates
export interface ChannelSectionContentDetails {
  channels: string[];
  // playlists field omitted as not used in your implementation
}

// VIDEOS endpoint - Updates
export interface Video {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string; // ISO 8601
    description: string;
    tags?: string[]; // Made optional to match your implementation
    categoryId: string;
    // Other snippet fields still included
  };
  statistics: {
    viewCount: string; // Will be parsed as number
    likeCount: string; // Will be parsed as number
    favoriteCount: string; // Will be parsed as number
    commentCount: string; // Will be parsed as number
  };
  topicDetails?: {
    topicCategories?: string[]; // Made optional to match your implementation
    // topicIds and relevantTopicIds omitted as not used
  };
  paidProductPlacementDetails?: {
    hasPaidProductPlacement?: boolean; // Made optional to match your implementation
  };
}

// COMMENTS endpoint - Updates
export interface Comment {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    authorDisplayName: string;
    textDisplay: string;
    likeCount: number; // Already a number in your implementation
    publishedAt: string;
    // Other comment fields still included but not used
  };
}

export interface CommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
        // Other fields omitted as not used in your implementation
      };
    };
    totalReplyCount: number;
    // Other fields still included
  };
  // replies field omitted as not used in your implementation
}

// Additional types used in your service functions
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

export interface FormattedVideoData {
  id: string;
  title: string;
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

export interface FeaturedChannels {
  channels: string[];
}

export interface FormattedActivity {
  title: string;
  thumbnailUrl: string;
  videoId: string;
}

// Type for API parameters
export interface YouTubeApiParams {
  [key: string]: string | number | undefined;
}