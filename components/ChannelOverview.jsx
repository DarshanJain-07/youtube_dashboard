import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ChannelSearch from './ChannelSearch';
import { BarChart2, Users, Eye } from "lucide-react";

export default function ChannelOverview({ channelId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [compareChannelName, setCompareChannelName] = useState('');
  const [compareChannelData, setCompareChannelData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  
  useEffect(() => {
    async function fetchChannelData() {
      if (!channelId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/youtube/channel-analytics?channelId=${channelId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch channel data');
        }
        
        const data = await response.json();
        setChannelData(data);
      } catch (err) {
        setError('Error loading channel data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChannelData();
  }, [channelId]);
  
  const fetchCompareChannel = async (compareChannelId) => {
    if (!compareChannelId) return;
    
    setCompareLoading(true);
    
    try {
      const response = await fetch(`/api/youtube/channel-analytics?channelId=${compareChannelId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison channel data');
      }
      
      const data = await response.json();
      setCompareChannelData(data);
      setCompareChannelName(data.channelInfo.snippet.title);
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };
  
  const handleOpenSearchDialog = () => {
    setShowSearchDialog(true);
  };
  
  const handleCloseSearchDialog = () => {
    setShowSearchDialog(false);
  };
  
  const handleChannelSelect = (selectedChannelId) => {
    fetchCompareChannel(selectedChannelId);
    setShowSearchDialog(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-red-500 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-center"
      >
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }
  
  if (!channelData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-center"
      >
        <p className="text-gray-600">No channel data available</p>
      </motion.div>
    );
  }
  
  const { channelInfo } = channelData;
  
  return (
    <div className="w-full space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <motion.img 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            src={channelInfo.snippet.thumbnails.high.url} 
            alt={channelInfo.snippet.title}
            className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover shadow-sm"
          />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-semibold mb-2 text-gray-900">{channelInfo.snippet.title}</h1>
            <p className="text-gray-600 text-sm mb-4">{channelInfo.snippet.description ? channelInfo.snippet.description.substring(0, 200) + (channelInfo.snippet.description.length > 120 ? '...' : '') : 'No description available'}</p>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Users size={18} className="text-red-500" />
                  <p className="text-sm font-medium text-gray-600">Subscribers</p>
                </div>
                <p className="text-xl font-bold text-gray-900 text-center md:text-left">{formatNumber(channelInfo.statistics.subscriberCount)}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <BarChart2 size={18} className="text-blue-500" />
                  <p className="text-sm font-medium text-gray-600">Videos</p>
                </div>
                <p className="text-xl font-bold text-gray-900 text-center md:text-left">{formatNumber(channelInfo.statistics.videoCount)}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Eye size={18} className="text-green-500" />
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                </div>
                <p className="text-xl font-bold text-gray-900 text-center md:text-left">{formatNumber(channelInfo.statistics.viewCount)}</p>
              </motion.div>
            </div>
          </div>
    
          <div className="w-full md:w-auto relative">
            <div className="flex flex-col gap-2">
              <motion.button 
                onClick={handleOpenSearchDialog}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 border border-red-500 text-white text-xl font-medium transition-all hover:bg-red-700 shadow-sm"
              >
                {compareChannelName ? '-' : '+'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation Tabs */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {['overview', 'content', 'audience', 'engagement', 'comparison'].map((tab, index) => (
          <motion.button
            key={tab}
            className={`flex items-center gap-2 px-5 py-3 rounded-md transition-all font-medium ${
              activeTab === tab 
                ? "bg-red-50 text-red-600 border border-red-100" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * index }}
          >
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </motion.button>
        ))}
      </motion.nav>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
      >
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 border border-gray-100">
          {activeTab === 'overview' && 'Channel performance overview charts will appear here'}
          {activeTab === 'content' && 'Content performance analytics will appear here'}
          {activeTab === 'audience' && 'Audience demographics will appear here'}
          {activeTab === 'engagement' && 'Engagement metrics will appear here'}
          {activeTab === 'comparison' && (compareChannelData ? 'Comparison data will appear here' : 'Select a channel to compare first')}
        </div>
      </motion.div>
      
      {/* Search Dialog */}
      <AnimatePresence>
        {showSearchDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCloseSearchDialog}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Search for a channel to compare</h2>
                <button 
                  onClick={handleCloseSearchDialog}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <ChannelSearch onChannelSelect={handleChannelSelect} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatNumber(num) {
  if (num>=1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}