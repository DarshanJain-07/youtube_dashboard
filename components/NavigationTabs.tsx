import React from 'react';
import { motion } from 'framer-motion';
import { TabType } from './types';

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  const tabs: TabType[] = ['overview', 'content', 'audience', 'engagement', 'comparison'];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-x-auto sticky top-0 z-10 pt-2 bg-transparent"
    >
      <div className="flex gap-2 min-w-max px-1">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab}
            className={`flex items-center gap-1 px-3 sm:px-5 py-2 sm:py-3 rounded-md transition-all text-sm font-medium ${
              activeTab === tab 
                ? "bg-primary-50 text-primary-600 border border-primary-100" 
                : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 hover:text-neutral-900"
            }`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <span className="capitalize">{tab}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}