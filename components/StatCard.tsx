import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'green';
  delay: number;
}

export default function StatCard({ title, value, icon: Icon, color, delay }: StatCardProps) {
  const colorMap = {
    red: {
      bgGradient: 'from-rose-50 to-red-100',
      border: 'border-red-200',
      iconBg: 'bg-red-500',
      textColor: 'text-red-700',
      valueColor: 'text-red-900',
      accent: 'bg-red-500',
      blur: 'bg-red-500/10'
    },
    blue: {
      bgGradient: 'from-blue-50 to-indigo-100',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      accent: 'bg-blue-500',
      blur: 'bg-blue-500/10'
    },
    green: {
      bgGradient: 'from-emerald-50 to-green-100',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700',
      valueColor: 'text-green-900',
      accent: 'bg-green-500',
      blur: 'bg-green-500/10'
    }
  };

  const styles = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -8, 
        scale: 1.05,
        transition: { type: "spring", stiffness: 300 }
      }}
      className={`relative overflow-hidden p-4 sm:p-6 rounded-xl bg-gradient-to-br ${styles.bgGradient} border ${styles.border} shadow-lg`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${styles.blur} blur-xl`}></div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${styles.iconBg} rounded-lg shadow-md`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className={`text-xs sm:text-sm font-semibold ${styles.textColor}`}>{title}</p>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${styles.valueColor}`}>{value}</p>
      <div className={`absolute bottom-0 right-0 w-1/3 h-1 ${styles.accent} rounded-tl-lg`}></div>
    </motion.div>
  );
}