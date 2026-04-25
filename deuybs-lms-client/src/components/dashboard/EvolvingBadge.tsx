// Path: src/components/dashboard/EvolvingBadge.tsx

import { motion } from 'framer-motion';
import { Award, Zap, Shield } from 'lucide-react';
import type { BadgeDto } from '../../types';

interface Props {
  badge: BadgeDto;
  size?: 'sm' | 'md' | 'lg';
}

export default function EvolvingBadge({ badge, size = 'md' }: Props) {
  const isHighLevel = badge.level >= 3;
  const isMasterLevel = badge.level >= 5;

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl'
  };

  const getGlowColor = () => {
    if (isMasterLevel) return 'shadow-[0_0_30px_rgba(234,179,8,0.5)] border-yellow-400';
    if (isHighLevel) return 'shadow-[0_0_20px_rgba(79,70,229,0.3)] border-indigo-400';
    return 'border-slate-200 dark:border-slate-700';
  };

  const getTierIcon = () => {
    if (isMasterLevel) return <Award size={14} className="text-yellow-500 fill-yellow-500" />;
    if (isHighLevel) return <Zap size={14} className="text-indigo-500 fill-indigo-500" />;
    return <Shield size={14} className="text-slate-400" />;
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="flex flex-col items-center group cursor-help"
      title={`${badge.displayName} - Seviye ${badge.level}\n${badge.description}`}
    >
      <div className={`relative ${sizeClasses[size]} bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 ${getGlowColor()}`}>
        {/* Animated Rings for high levels */}
        {(isHighLevel || isMasterLevel) && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute -inset-2 border-2 border-dashed rounded-[2rem] opacity-30 ${isMasterLevel ? 'border-yellow-400' : 'border-indigo-400'}`}
          />
        )}
        
        <span className="relative z-10 drop-shadow-md">{badge.iconEmoji}</span>
        
        {/* Level Badge Overlay */}
        <div className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-lg border border-white/20 flex items-center gap-1">
          {getTierIcon()}
          Lvl {badge.level}
        </div>
      </div>
      
      <p className="mt-3 font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity text-center leading-tight">
        {badge.displayName}
      </p>
    </motion.div>
  );
}
