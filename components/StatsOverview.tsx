import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Users, BarChart2, Eye } from 'lucide-react';

// Types
interface ChannelStatistics {
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

// Utility function
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// StatCard Component
interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'success';
  delay: number;
}

function StatCard({ title, value, icon: Icon, color, delay }: StatCardProps) {
  const colorMap = {
    primary: {
      bgGradient: 'from-primary-50 to-primary-100',
      border: 'border-primary-200',
      iconBg: 'bg-primary-500',
      textColor: 'text-primary-700',
      valueColor: 'text-primary-900',
      accent: 'bg-primary-500',
      blur: 'bg-primary-500/10'
    },
    secondary: {
      bgGradient: 'from-secondary-50 to-secondary-100',
      border: 'border-secondary-200',
      iconBg: 'bg-secondary-500',
      textColor: 'text-secondary-700',
      valueColor: 'text-secondary-900',
      accent: 'bg-secondary-500',
      blur: 'bg-secondary-500/10'
    },
    success: {
      bgGradient: 'from-success-50 to-success-100',
      border: 'border-success-200',
      iconBg: 'bg-success-500',
      textColor: 'text-success-700',
      valueColor: 'text-success-900',
      accent: 'bg-success-500',
      blur: 'bg-success-500/10'
    }
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`card relative overflow-hidden bg-gradient-to-br ${colors.bgGradient} ${colors.border} p-5 sm:p-6`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-base font-medium ${colors.textColor} mb-1`}>{title}</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${colors.valueColor}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors.iconBg} text-white`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="absolute -bottom-5 -right-5 w-24 h-24 opacity-10">
        <div className={`w-full h-full rounded-full ${colors.blur}`}></div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function StatsOverview({ subscriberCount, videoCount, viewCount }: ChannelStatistics) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
    >
      <StatCard
        title="Subscribers"
        value={formatNumber(subscriberCount)}
        icon={Users}
        color="primary"
        delay={0.1}
      />
      <StatCard
        title="Videos"
        value={formatNumber(videoCount)}
        icon={BarChart2}
        color="secondary"
        delay={0.2}
      />
      <StatCard
        title="Total Views"
        value={formatNumber(viewCount)}
        icon={Eye}
        color="success"
        delay={0.3}
      />
    </motion.div>
  );
}