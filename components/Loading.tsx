import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <div className={`${sizeClasses[size]} rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin mb-4`}></div>
      {message && <p className="text-neutral-600">{message}</p>}
    </motion.div>
  );
} 