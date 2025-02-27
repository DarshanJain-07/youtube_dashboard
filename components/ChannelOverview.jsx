//components/ChannelOverview.tsx
import { useState, useEffect, React } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ChannelSearch from './ChannelSearch';
import { Users, BarChart2, Eye } from 'lucide-react';


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
    <div className="w-full px-2 sm:px-0 pb-20">
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
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
              <div className="grid grid-cols-3 gap-6 mt-8 px-4">
                {/* Subscribers Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-rose-50 to-red-100 border border-red-200 shadow-lg"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-red-500/10 blur-xl"></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500 rounded-lg shadow-md">
                      <Users size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-red-700">Subscribers</p>
                  </div>
                  <p className="text-3xl font-bold text-red-900">{formatNumber(channelInfo.statistics.subscriberCount)}</p>
                  <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-red-500 rounded-tl-lg"></div>
                </motion.div>
                
                {/* Videos Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-lg"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                      <BarChart2 size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700">Videos</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{formatNumber(channelInfo.statistics.videoCount)}</p>
                  <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-blue-500 rounded-tl-lg"></div>
                </motion.div>
                
                {/* Views Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-green-200 shadow-lg"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-green-500/10 blur-xl"></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg shadow-md">
                      <Eye size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-700">Total Views</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{formatNumber(channelInfo.statistics.viewCount)}</p>
                  <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-green-500 rounded-tl-lg"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-x-auto sticky top-0 z-10 pt-2 pl-4 bg-transparent"
        >
          <div className="flex gap-2 min-w-max">
            {['overview', 'content', 'audience', 'engagement', 'comparison'].map((tab, index) => (
              <motion.button
                key={tab}
                className={`flex items-center gap-1 px-3 sm:px-5 py-2 sm:py-3 rounded-md transition-all text-sm sm:text-base font-medium ${
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
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 border border-gray-100 text-sm sm:text-base text-center px-4">
            {activeTab === 'overview' && 'Channel performance overview charts will appear here'}
            {activeTab === 'content' && 'Content performance analytics will appear here'}
            {activeTab === 'audience' && 'Audience demographics will appear here'}
            {activeTab === 'engagement' && 'Engagement metrics will appear here'}
            {activeTab === 'comparison' && (compareChannelData ? 'Comparison data will appear here' : 'Select a channel to compare first')}
          </div>
        </motion.div>
      </div>
      
      {/* Fixed Compare Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button 
          onClick={handleOpenSearchDialog}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 border border-red-500 text-white text-xl font-medium transition-all hover:bg-red-700 shadow-md"
        >
          {compareChannelName ? '?' : '+'}
        </motion.button>
      </motion.div>
      
      {/* Search Dialog */}
      <AnimatePresence>
        {showSearchDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseSearchDialog}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
                <button 
                  onClick={handleCloseSearchDialog}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3 sm:p-4">
                <ChannelSearch onChannelSelect={handleChannelSelect} headingText="Compare with your favourite youtube channels?" />
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