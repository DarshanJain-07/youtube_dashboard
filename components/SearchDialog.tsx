import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChannelSearch from './ChannelSearch';

interface SearchDialogProps {
  showSearchDialog: boolean;
  onClose: () => void;
  onChannelSelect: (channelId: string) => void;
}

export default function SearchDialog({ showSearchDialog, onClose, onChannelSelect }: SearchDialogProps) {
  return (
    <AnimatePresence>
      {showSearchDialog && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
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
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <ChannelSearch onChannelSelect={onChannelSelect} headingText="Compare with your favourite youtube channels?" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}