"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, HelpCircle, TrendingUp, BarChart2, Users } from "lucide-react";
import ChannelSearch from '@/components/ChannelSearch';

export default function YoutubePage() {
  const router = useRouter();
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [hasSearchResults, setHasSearchResults] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    router.push('/channelinfo');
  };

  const handleSearchResultsChange = (resultsCount: number) => {
    setHasSearchResults(resultsCount > 0);
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  const staggerCards = {
    container: {
      animate: { 
        transition: { 
          staggerChildren: 0.1 
        } 
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-between items-center w-full py-3 px-3 sm:px-6 bg-white rounded-b-xl shadow-sm border-b border-gray-100"
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white font-bold text-sm">YT</div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Studio <span className="text-gray-400 font-normal">Analytics</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-2 sm:gap-5">
            <motion.a
              href="#"
              className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle size={16} />
              <span>Help</span>
            </motion.a>
            <motion.a
              href="#"
              className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </motion.a>
            <motion.a
              href="#"
              className="sm:hidden text-gray-600 hover:text-gray-900"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle size={20} />
            </motion.a>
            <motion.a
              href="#"
              className="sm:hidden text-gray-600 hover:text-gray-900"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={20} />
            </motion.a>
            <motion.button 
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.97 }}
            >
              <Bell size={18} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        </motion.header>
        
        <main className="relative mt-4 sm:mt-8 mb-16 sm:mb-20 max-w-6xl mx-auto px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key="search"
              {...fadeInUp}
              className="space-y-6 sm:space-y-8"
            >
              {/* Search Section */}
              <div className="text-center mb-8 sm:mb-12">
                <motion.h2 
                  className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Analyze Your YouTube Performance
                </motion.h2>
                <motion.p 
                  className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Get insights, track growth, and optimize your content strategy
                </motion.p>
              </div>

              {/* Channel Search Component */}
              <ChannelSearch 
                onChannelSelect={handleChannelSelect} 
                headingText="Search here to know more about 👇"
                onResultsChange={handleSearchResultsChange}
              />
              
              {/* Feature Cards - Only show when no search results */}
              <AnimatePresence>
                {!hasSearchResults && (
                  <motion.div
                    variants={staggerCards.container}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-12 sm:mt-16"
                  >
                    <h3 className={`text-lg font-medium text-gray-800 mb-6 sm:mb-8 px-1`}>Why use YT Studio Analytics?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      {[
                        { 
                          icon: <TrendingUp size={24} className="text-red-500" />, 
                          title: "Real-time Performance", 
                          description: "Monitor views, engagement, and subscriber growth with up-to-the-minute data",
                          color: "from-red-500 to-red-400"
                        },
                        { 
                          icon: <BarChart2 size={24} className="text-blue-500" />, 
                          title: "Audience Insights", 
                          description: "Understand your viewers with deep demographic and behavioral analytics",
                          color: "from-blue-500 to-blue-400" 
                        },
                        { 
                          icon: <Users size={24} className="text-green-500" />, 
                          title: "Community Building", 
                          description: "Grow a loyal audience using AI-powered content strategy recommendations",
                          color: "from-green-500 to-green-400"
                        }
                      ].map((card, index) => (
                        <motion.div
                          key={index}
                          variants={staggerCards.item}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className={`rounded-xl overflow-hidden bg-white border-gray-200 border shadow-sm transition-all duration-300`}
                        >
                          <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                          <div className="p-6">
                            <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                              {card.icon}
                            </div>
                            <h4 className='font-semibold text-lg mb-2 text-black'>{card.title}</h4>
                            <p className='text-gray-500 text-sm'>{card.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}