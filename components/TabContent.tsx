import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType } from './types';

interface TabContentProps {
  activeTab: TabType;
  children: React.ReactNode;
}

export default function TabContent({ activeTab, children }: TabContentProps) {
  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-1 sm:p-2"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}