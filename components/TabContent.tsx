import React from 'react';
import { TabType, ChannelData } from './types';

interface TabContentProps {
  activeTab: TabType;
  compareChannelData: ChannelData | null;
}

export default function TabContent({ activeTab, compareChannelData }: TabContentProps) {
  let content = '';
  
  switch (activeTab) {
    case 'overview':
      content = 'Channel performance overview charts will appear here';
      break;
    case 'content':
      content = 'Content performance analytics will appear here';
      break;
    case 'audience':
      content = 'Audience demographics will appear here';
      break;
    case 'engagement':
      content = 'Engagement metrics will appear here';
      break;
    case 'comparison':
      content = compareChannelData ? 'Comparison data will appear here' : 'Select a channel to compare first';
      break;
    default:
      content = 'No content available';
  }
  
  return (
    <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 border border-gray-100 text-sm sm:text-base text-center px-4">
      {content}
    </div>
  );
}