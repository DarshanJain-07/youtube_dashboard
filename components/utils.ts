import { FormattedChannelInfo, FormattedVideoData } from './types';

/**
 * Formats a number to a human-readable string with K, M, B suffixes
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num;
  
  if (numValue >= 1000000000) {
    return (numValue / 1000000000).toFixed(1) + 'B';
  }
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  return numValue.toString();
}

/**
 * Date formatting options
 */
export type DateFormatOptions = {
  monthFormat?: 'short' | 'long';
  includeTime?: boolean;
}

/**
 * Central date formatting function with flexible options
 */
export function formatDate(isoDate: string, options: DateFormatOptions = {}): string {
  const { monthFormat = 'short', includeTime = false } = options;
  const date = new Date(isoDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: monthFormat, 
    day: 'numeric',
  };
  
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', formatOptions);
}

// For backwards compatibility with existing code
export function formatDateShort(isoDate: string): string {
  return formatDate(isoDate, { monthFormat: 'short', includeTime: false });
}

export function formatDateLong(isoDate: string): string {
  return formatDate(isoDate, { monthFormat: 'long', includeTime: false });
}

export function formatDateWithTime(isoDate: string): string {
  return formatDate(isoDate, { monthFormat: 'short', includeTime: true });
}

// VIDEO-LEVEL METRICS
export function calculateEngagementRatio(video: FormattedVideoData): number {
  return ((video.likeCount + video.commentCount) / video.viewCount) * 100;
}

export function calculateEngagementDepthScore(video: FormattedVideoData): number {
  return ((video.likeCount + (video.commentCount * 3)) / video.viewCount) * 100;
}

export function calculateViewToSubRatio(video: FormattedVideoData, channel: FormattedChannelInfo): number {
  return (video.viewCount / channel.subscriberCount) * 100;
}

export function calculateVideoEfficiencyIndex(video: FormattedVideoData, channel: FormattedChannelInfo): number {
  const videoAgeInDays = (new Date().getTime() - new Date(video.publishedAt).getTime()) / (1000 * 3600 * 24);
  const channelAgeInDays = (new Date().getTime() - new Date(channel.publishedAt).getTime()) / (1000 * 3600 * 24);
  
  const videoViewsPerDay = video.viewCount / videoAgeInDays;
  const channelAvgViewsPerDay = channel.viewCount / channelAgeInDays;
  
  return videoViewsPerDay / channelAvgViewsPerDay;
}

export function calculateDailyEngagementDensity(video: FormattedVideoData): number {
  const videoAgeInDays = Math.max(1, (new Date().getTime() - new Date(video.publishedAt).getTime()) / (1000 * 3600 * 24));
  return (video.likeCount + video.commentCount) / videoAgeInDays;
}

export function calculateAudienceInteractionRatio(video: FormattedVideoData, channel: FormattedChannelInfo): number {
  return ((video.likeCount + video.commentCount) / channel.subscriberCount) * 1000;
}

// CHANNEL-LEVEL METRICS
export function calculateSubscriberConversionRate(channel: FormattedChannelInfo): number {
  return (channel.subscriberCount / channel.viewCount) * 1000;
}

export function calculateChannelActivityRatio(channel: FormattedChannelInfo): number {
  const channelAgeInDays = (new Date().getTime() - new Date(channel.publishedAt).getTime()) / (1000 * 3600 * 24);
  return channel.videoCount / channelAgeInDays;
}

export function calculateChannelEfficiencyIndex(
  channel: FormattedChannelInfo, 
  videos: FormattedVideoData[]
): number {
  const avgViewsPerVideo = channel.viewCount / channel.videoCount;
  
  // Calculate average engagement ratio across all videos
  const totalEngagementRatio = videos.reduce((sum, video) => {
    return sum + ((video.likeCount + video.commentCount) / video.viewCount);
  }, 0);
  const avgEngagementRatio = totalEngagementRatio / videos.length;
  
  return (avgViewsPerVideo * avgEngagementRatio) / channel.videoCount;
}

export function calculateAudienceRetentionStrength(channel: FormattedChannelInfo): number {
  const avgViewsPerVideo = channel.viewCount / channel.videoCount;
  return (avgViewsPerVideo / channel.subscriberCount) * (1 + (channel.videoCount / 100));
}

export function calculateChannelGrowthMomentum(channel: FormattedChannelInfo): number {
  const channelAgeInDays = (new Date().getTime() - new Date(channel.publishedAt).getTime()) / (1000 * 3600 * 24);
  return (channel.subscriberCount / channelAgeInDays) * (channel.videoCount / 10);
}

export function calculateContentSubscriberEfficiency(channel: FormattedChannelInfo): number {
  return channel.subscriberCount / channel.videoCount;
}