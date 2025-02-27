import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps = {}) {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-t-2 border-r-2 border-red-500 animate-spin" />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}

interface ErrorProps {
  message: string;
}

export function Error({ message }: ErrorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-center"
    >
      <p className="text-red-600">{message}</p>
    </motion.div>
  );
}