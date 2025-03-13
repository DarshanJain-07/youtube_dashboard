"use client"
import React, { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { formatNumber } from './utils';

export interface VideoStatsProps {
  videoData: any[];
  channelMetrics: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ChannelGraphs: React.FC<VideoStatsProps> = ({ videoData, channelMetrics }) => {
  // Add state for active chart elements
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<string>('views');
  
  // Early return if no data available
  if (!videoData || videoData.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[300px] bg-white rounded-xl shadow">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  // Format video data for charts
  // Sort videos by publish date (newest first for trending analysis)
  const sortedVideos = [...videoData].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Prepare data for top videos by views
  const topVideosByViews = [...videoData]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)
    .map(video => ({
      name: video.title ? (video.title.length > 15 ? video.title.substring(0, 15) + '...' : video.title) : 'Untitled',
      views: video.viewCount
    }));

  // Prepare data for engagement metrics comparison
  const engagementData = videoData.map(video => ({
    name: video.title ? (video.title.length > 12 ? video.title.substring(0, 12) + '...' : video.title) : 'Untitled',
    likes: video.likeCount,
    comments: video.commentCount,
    engagement: ((video.likeCount + video.commentCount) / video.viewCount) * 100
  }));

  // Prepare data for engagement ratio distribution
  const engagementRatioData = videoData.map(video => {
    const ratio = ((video.likeCount + video.commentCount) / video.viewCount) * 100;
    return {
      name: video.title ? (video.title.length > 15 ? video.title.substring(0, 15) + '...' : video.title) : 'Untitled',
      ratio: parseFloat(ratio.toFixed(2))
    };
  }).sort((a, b) => b.ratio - a.ratio).slice(0, 10);

  // Format data for view trends over time
  const viewTrendData = sortedVideos.slice(0, 10).map(video => ({
    name: new Date(video.publishedAt).toLocaleDateString(),
    views: video.viewCount,
    likes: video.likeCount,
    comments: video.commentCount
  })).reverse(); // Reverse to show oldest to newest

  // Format data for top video categories
  const categoryCounts: {[key: string]: number} = {};
  videoData.forEach(video => {
    if (video.categoryId) {
      if (!categoryCounts[video.categoryId]) categoryCounts[video.categoryId] = 0;
      categoryCounts[video.categoryId]++;
    }
  });
  
  const categoryData = Object.keys(categoryCounts).map(category => ({
    name: `Category ${category}`,
    value: categoryCounts[category]
  }));

  // Add a function to handle chart element mouse over
  const handleMouseOver = (data: any, index: number) => {
    setActiveIndex(index);
  };
  
  // Add formatter for YAxis values
  const formatYAxis = (value: number) => {
    return formatNumber(value);
  };
  
  // Add a selector for different metrics in the time-series chart
  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };
  
  // Prepare engagement over time data
  const engagementTimeData = sortedVideos.slice(0, 15).map(video => {
    const date = new Date(video.publishedAt);
    const engagementRatio = ((video.likeCount + video.commentCount) / video.viewCount) * 100;
    return {
      name: date.toLocaleDateString(),
      date: date.getTime(),
      views: video.viewCount,
      likes: video.likeCount,
      comments: video.commentCount,
      engagement: parseFloat(engagementRatio.toFixed(2))
    };
  }).sort((a, b) => a.date - b.date); // Sort by date ascending

  return (
    <motion.div 
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-6"
    > 
      {/* View Trend Chart with Metric Selector */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Performance Trends</h3>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span className="text-sm text-gray-500">Metric:</span>
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button 
                onClick={() => handleMetricChange('views')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === 'views' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                Views
              </button>
              <button 
                onClick={() => handleMetricChange('likes')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === 'likes' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                Likes
              </button>
              <button 
                onClick={() => handleMetricChange('comments')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === 'comments' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                Comments
              </button>
              <button 
                onClick={() => handleMetricChange('engagement')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === 'engagement' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                Engagement %
              </button>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={engagementTimeData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7c43" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff7c43" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={formatYAxis} 
              domain={selectedMetric === 'engagement' ? [0, 'auto'] : ['auto', 'auto']}
              label={
                selectedMetric === 'engagement' 
                ? { value: 'Engagement %', angle: -90, position: 'insideLeft' } 
                : { value: 'Count', angle: -90, position: 'insideLeft' }
              }
            />
            <Tooltip 
              formatter={(value: number) => 
                selectedMetric === 'engagement' 
                  ? `${value.toFixed(2)}%` 
                  : formatNumber(value)
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {selectedMetric === 'views' && (
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#8884d8" 
                fill="url(#colorViews)" 
                name="Views"
                activeDot={{ r: 8, onClick: (e: any) => console.log(e) }}
              />
            )}
            {selectedMetric === 'likes' && (
              <Area 
                type="monotone" 
                dataKey="likes" 
                stroke="#82ca9d" 
                fill="url(#colorLikes)" 
                name="Likes"
                activeDot={{ r: 8, onClick: (e: any) => console.log(e) }}
              />
            )}
            {selectedMetric === 'comments' && (
              <Area 
                type="monotone" 
                dataKey="comments" 
                stroke="#ffc658" 
                fill="url(#colorComments)" 
                name="Comments"
                activeDot={{ r: 8, onClick: (e: any) => console.log(e) }}
              />
            )}
            {selectedMetric === 'engagement' && (
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="#ff7c43" 
                fill="url(#colorEngagement)" 
                name="Engagement %"
                activeDot={{ r: 8, onClick: (e: any) => console.log(e) }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Comparative Performance Chart - New */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={engagementData.slice(0, 6)} // Limit to 6 videos for better readability
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatYAxis} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 'auto']} tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'engagement') return `${value.toFixed(2)}%`;
                return formatNumber(value);
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="center"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Bar yAxisId="left" dataKey="likes" name="Likes" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="comments" name="Comments" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="engagement" name="Engagement %" stroke="#ff7300" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Videos by Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Videos by Views</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={topVideosByViews}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseMove={(data: any) => data.activeTooltipIndex !== undefined && setActiveIndex(data.activeTooltipIndex)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatYAxis} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                tick={{ fontSize: 12 }}
                tickMargin={5}
              />
              <Tooltip 
                formatter={(value: number) => formatNumber(value)} 
                labelFormatter={(label) => `Video: ${label}`}
              />
              <Bar 
                dataKey="views" 
                fill="#8884d8" 
                name="Views"
                onMouseOver={handleMouseOver}
              >
                {topVideosByViews.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={'#8884d8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Ratio Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Videos by Engagement Ratio (%)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={engagementRatioData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 12 }}
                tickMargin={5}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => `Video: ${label}`}
              />
              <Bar dataKey="ratio" fill="#82ca9d" name="Engagement Ratio (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution and Engagement Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} videos`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Metrics Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Channel Performance Metrics</h3>
          {channelMetrics && Object.keys(channelMetrics).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                {
                  subject: 'Subscriber Rate',
                  value: Math.min(channelMetrics.subscriberConversionRate || 0, 10),
                  fullMark: 10,
                },
                {
                  subject: 'Activity Ratio',
                  value: Math.min(channelMetrics.channelActivityRatio || 0, 10),
                  fullMark: 10,
                },
                {
                  subject: 'Retention',
                  value: Math.min(channelMetrics.audienceRetentionStrength || 0, 10),
                  fullMark: 10,
                },
                {
                  subject: 'Growth',
                  value: Math.min(channelMetrics.channelGrowthMomentum * 0.1 || 0, 10),
                  fullMark: 10,
                },
                {
                  subject: 'Efficiency',
                  value: Math.min(channelMetrics.contentSubscriberEfficiency * 0.01 || 0, 10),
                  fullMark: 10,
                },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No metrics data available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChannelGraphs; 