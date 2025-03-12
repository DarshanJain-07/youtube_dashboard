import { FormattedChannelInfo, FormattedVideoData, TooltipState } from './types';

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
export function limitWords(text: string, wordCount: number): string {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

// Animation variants for framer-motion
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// CSS for marquee animation
export const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .animate-marquee-pausable {
    animation: marquee 40s linear infinite;
    min-width: 200%;
  }
  
  .animate-marquee-pausable:hover {
    animation-play-state: paused;
  }
  
  .marquee-container {
    position: relative;
  }
  
  .marquee-container:hover .animate-marquee-pausable {
    animation-play-state: paused;
  }
  
  /* Add this to ensure tooltips don't get stuck */
  [data-tooltip-id] {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  [data-tooltip-id]:hover {
    z-index: 1;
  }
`;

// Function to add marquee styles to document
export function addMarqueeStylesToDocument(): void {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = marqueeStyles;
    document.head.appendChild(styleElement);
  }
}

/**
 * Helper function to update tooltip data
 */
export function updateTooltipData(element: HTMLElement | null): Partial<TooltipState> {
  if (!element) {
    return {
      id: null,
      title: '',
      content: '',
      isTop: false,
      x: 0,
      y: 0
    };
  }
  
  const tooltipId = element.getAttribute('data-tooltip-id');
  const tooltipTitle = element.getAttribute('data-tooltip-title') || '';
  const tooltipContent = element.getAttribute('data-tooltip-content') || '';
  
  // Get the container to determine position
  const container = element.closest('.marquee-container') as HTMLElement;
  const isTop = container?.dataset?.tooltipPosition === 'top';
  
  // Calculate position
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const y = isTop ? rect.top : rect.bottom;
  
  return {
    id: tooltipId,
    title: tooltipTitle,
    content: tooltipContent,
    isTop: isTop,
    x: centerX,
    y: y
  };
}