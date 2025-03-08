import React from 'react';
import { motion } from 'framer-motion';

interface LoadingErrorProps {
  message: string;
  retry?: () => void;
}

export default function LoadingError({ message, retry }: LoadingErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p className="text-lg font-medium mb-3 text-neutral-800">{message}</p>
      {retry && (
        <motion.button
          onClick={retry}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary"
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
}