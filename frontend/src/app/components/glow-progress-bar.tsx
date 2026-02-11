import React from 'react';
import { motion } from 'motion/react';

interface GlowProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'teal' | 'amber' | 'red';
  showLabel?: boolean;
}

export function GlowProgressBar({
  value,
  max = 100,
  color = 'blue',
  showLabel = true,
}: GlowProgressBarProps) {
  const percentage = max <= 1 ? value * 100 : (value / max) * 100;
  const colors = {
    blue: 'from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
    teal: 'from-teal-500 to-cyan-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]',
    amber: 'from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
    red: 'from-red-500 to-pink-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
  };

  return (
    <div className="w-full">
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r rounded-full ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="text-right mt-1 text-xs text-gray-400">
          {max <= 1 ? Math.round(value * 100) : Math.round((value / max) * 100)}%
        </div>
      )}
    </div>
  );
}
