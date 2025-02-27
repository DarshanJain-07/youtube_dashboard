export interface ChannelStatistics {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  }
  
  export interface ChannelThumbnail {
    url: string;
    width?: number;
    height?: number;
  }
  
  export interface ChannelSnippet {
    title: string;
    description: string;
    thumbnails: {
      default?: ChannelThumbnail;
      medium?: ChannelThumbnail;
      high: ChannelThumbnail;
    };
  }
  
  export interface ChannelInfo {
    id: string;
    snippet: ChannelSnippet;
    statistics: ChannelStatistics;
  }
  
  export interface ChannelData {
    channelInfo: ChannelInfo;
    // Add other properties as needed
  }
  
  export type TabType = 'overview' | 'content' | 'audience' | 'engagement' | 'comparison';