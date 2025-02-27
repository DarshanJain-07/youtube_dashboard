import React from 'react';
import { motion } from 'framer-motion';

interface CompareButtonProps {
  compareChannelName: string;
  onOpenSearchDialog: () => void;
}

export default function CompareButton({ compareChannelName, onOpenSearchDialog }: CompareButtonProps) {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-20"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <motion.button 
        onClick={onOpenSearchDialog}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 border border-red-500 text-white text-xl font-medium transition-all hover:bg-red-700 shadow-md"
      >
        {compareChannelName ? '?' : '+'}
      </motion.button>
    </motion.div>
  );
}