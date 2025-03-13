"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Bell, Settings, HelpCircle, TrendingUp, BarChart2, Users, ArrowRight, Youtube } from "lucide-react";
import ChannelSearch from '@/components/ChannelSearch';

// Enhanced animation variants with proper types
const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  },
  cardItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      } 
    }
  }
};

export default function YoutubePage() {
  const router = useRouter();
  const [hasSearchResults, setHasSearchResults] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    localStorage.setItem('selectedChannelId', channelId);
    router.push('/channelinfo');
  };

  const handleSearchResultsChange = (resultsCount: number) => {
    setHasSearchResults(resultsCount > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with proper z-index */}
      <div className="relative z-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 h-20 sm:h-28"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="pt-6 sm:pt-10 pb-24 sm:pb-32 flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <Youtube className="text-red-500 h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                  YouTube <span className="font-light">Analytics</span>
                </h1>
                <div className="hidden sm:block text-xs text-blue-100">Advanced insights for creators</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm rounded-lg">
                <HelpCircle size={16} />
                <span>Help</span>
              </button>
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm rounded-lg">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></span>
              </button>
            </motion.div>
          </header>
        </div>
      </div>
      
      {/* Main content with proper positioning and z-index */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24">
        <motion.div 
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
          variants={animations.fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="p-6 sm:p-8 md:p-10">
            {/* Hero section */}
            <motion.div 
              className="text-center mb-2 sm:mb-4"
              variants={animations.slideUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Unlock Your YouTube Channel&apos;s Potential
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get powerful insights, track growth metrics, and optimize your content strategy with our advanced analytics platform
              </p>
            </motion.div>
            
            {/* Search component */}
            <ChannelSearch 
              onChannelSelect={handleChannelSelect} 
              headingText="Search for any YouTube channel"
              onResultsChange={handleSearchResultsChange}
            />
            
            {/* Feature cards - Only show when no search results */}
            <AnimatePresence>
              {!hasSearchResults && (
                <motion.div
                  variants={animations.staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-10 sm:mt-10"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Why creators choose our analytics</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { 
                        icon: <TrendingUp size={24} className="text-white" />, 
                        title: "Real-time Performance", 
                        description: "Track views, engagement, and subscriber growth with up-to-the-minute data visualization",
                        color: "from-red-500 to-red-600",
                        accent: "bg-red-100"
                      },
                      { 
                        icon: <BarChart2 size={24} className="text-white" />, 
                        title: "Audience Insights", 
                        description: "Understand your viewers with detailed demographic and behavioral analytics dashboards",
                        color: "from-blue-500 to-blue-600",
                        accent: "bg-blue-100"
                      },
                      { 
                        icon: <Users size={24} className="text-white" />, 
                        title: "Community Growth", 
                        description: "Grow a loyal audience using AI-powered content strategy and engagement recommendations",
                        color: "from-green-500 to-green-600",
                        accent: "bg-green-100"
                      }
                    ].map((card, index) => (
                      <motion.div
                        key={index}
                        variants={animations.cardItem}
                        className="group rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="mb-4 flex">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                              {card.icon}
                            </div>
                          </div>
                          <h4 className="font-semibold text-lg mb-2 text-gray-900">{card.title}</h4>
                          <p className="text-gray-600 text-sm">{card.description}</p>
                          
                          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                            <span>Learn more</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}