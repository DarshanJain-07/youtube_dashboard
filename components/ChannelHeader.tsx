import React from 'react';
import { motion } from 'framer-motion';
import { ChannelInfo } from './types';

interface ChannelHeaderProps {
  channelInfo: ChannelInfo;
}

export default function ChannelHeader({ channelInfo }: ChannelHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
      <motion.img 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        src={channelInfo.snippet.thumbnails.high.url} 
        alt={channelInfo.snippet.title}
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg object-cover shadow-sm"
      />
      
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">{channelInfo.snippet.title}</h1>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
          {channelInfo.snippet.description 
            ? channelInfo.snippet.description.substring(0, 150) + (channelInfo.snippet.description.length > 150 ? '...' : '') 
            : 'No description available'}
        </p>
      </div>
    </div>
  );
}