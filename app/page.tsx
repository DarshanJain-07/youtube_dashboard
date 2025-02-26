"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import ChannelSearch from '../components/ChannelSearch';
import ChannelOverview from '../components/ChannelOverview';
import { Bell, Settings, HelpCircle, ChevronRight, Search, TrendingUp, BarChart2, Play, Users, Clock } from "lucide-react";

export default function Home() {
  const [selectedChannelId, setSelectedChannelId] = useState('');

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-between items-center w-full py-4 px-6 bg-white rounded-b-xl shadow-sm border-b border-gray-100"
        >
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">YT</div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Studio <span className="text-gray-400 font-normal">Analytics</span>
            </h1>
          </motion.div>
          
          <div className="flex items-center gap-5">
            <motion.a
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle size={16} />
              <span>Help</span>
            </motion.a>
            <motion.a
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </motion.a>
            <motion.button 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative"
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.97 }}
            >
              <Bell size={18} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
          </div>
        </motion.header>
        
        <main className="relative mt-8 mb-20 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {!selectedChannelId ? (
              <motion.div
                key="search"
                {...fadeInUp}
                className="space-y-8"
              >
                <div className="text-center mb-12">
                  <motion.h2 
                    className="text-3xl font-semibold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Analyze Your YouTube Performance
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Get insights, track growth, and optimize your content strategy
                  </motion.p>
                </div>
                
                <ChannelSearch onChannelSelect={handleChannelSelect} />
                
                <motion.div
                  variants={staggerCards.container}
                  initial="initial"
                  animate="animate"
                  className="mt-16"
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-6">Why use YT Studio Analytics?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: <TrendingUp size={24} className="text-red-500" />, title: "Track Performance", description: "Monitor views, engagement, and subscriber growth over time" },
                      { icon: <BarChart2 size={24} className="text-blue-500" />, title: "Analyze Audience", description: "Understand who watches your content and when they're most active" },
                      { icon: <Users size={24} className="text-green-500" />, title: "Grow Community", description: "Build a loyal audience with data-driven content decisions" }
                    ].map((card, index) => (
                      <motion.div
                        key={index}
                        variants={staggerCards.item}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-300"
                      >
                        <div className="mb-3">{card.icon}</div>
                        <h4 className="text-gray-700 font-medium mb-2">{card.title}</h4>
                        <p className="text-gray-400 text-sm">{card.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                {...fadeInUp}
              >
                <motion.button
                  onClick={() => setSelectedChannelId('')}
                  className="mb-8 px-4 py-2 rounded-md bg-white shadow-sm border border-gray-200 text-gray-700 flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back to Search
                </motion.button>                
                <ChannelOverview channelId={selectedChannelId} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}