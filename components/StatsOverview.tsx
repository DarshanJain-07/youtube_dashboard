import React from 'react';
import { Users, BarChart2, Eye } from 'lucide-react';
import { ChannelStatistics } from './types';
import { formatNumber } from './utils';
import StatCard from './StatCard';

interface StatsOverviewProps {
  statistics: ChannelStatistics;
}

export default function StatsOverview({ statistics }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8 px-2 sm:px-4">
      <StatCard 
        title="Subscribers" 
        value={formatNumber(statistics.subscriberCount)} 
        icon={Users} 
        color="red" 
        delay={0.1} 
      />
      
      <StatCard 
        title="Videos" 
        value={formatNumber(statistics.videoCount)} 
        icon={BarChart2} 
        color="blue" 
        delay={0.2} 
      />
      
      <StatCard 
        title="Total Views" 
        value={formatNumber(statistics.viewCount)} 
        icon={Eye} 
        color="green" 
        delay={0.3} 
      />
    </div>
  );
}