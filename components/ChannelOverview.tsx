import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Import types
import { ChannelData, TabType } from './types';

// Import components
import ChannelHeader from './ChannelHeader';
import StatsOverview from './StatsOverview';
import NavigationTabs from './NavigationTabs';
import TabContent from './TabContent';
import CompareButton from './CompareButton';
import SearchDialog from './SearchDialog';
import { Loading, Error as ErrorComponent } from './LoadingError';

interface ChannelOverviewProps {
  channelId: string;
}

export default function ChannelOverview({ channelId }: ChannelOverviewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [compareChannelName, setCompareChannelName] = useState('');
  const [compareChannelData, setCompareChannelData] = useState<ChannelData | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
  
  const fetchCompareChannel = async (compareChannelId: string) => {
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
  
  const handleChannelSelect = (selectedChannelId: string) => {
    fetchCompareChannel(selectedChannelId);
    setShowSearchDialog(false);
  };
  
  if (loading) {
    return <Loading />;
  }
  
  if (error) {
    return <ErrorComponent message={error} />;
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
          <ChannelHeader channelInfo={channelInfo} />
          <StatsOverview statistics={channelInfo.statistics} />
        </motion.div>
        
        {/* Navigation Tabs */}
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
        >
          <TabContent activeTab={activeTab} compareChannelData={compareChannelData} />
        </motion.div>
      </div>
      
      {/* Fixed Compare Button */}
      <CompareButton 
        compareChannelName={compareChannelName} 
        onOpenSearchDialog={handleOpenSearchDialog} 
      />
      
      {/* Search Dialog */}
      <SearchDialog 
        showSearchDialog={showSearchDialog} 
        onClose={handleCloseSearchDialog} 
        onChannelSelect={handleChannelSelect} 
      />
    </div>
  );
}