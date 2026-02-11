import React from 'react';
import { motion } from 'motion/react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  pulse?: boolean;
}

export function GlowButton({
  variant = 'primary',
  children,
  pulse = false,
  className = '',
  ...props
}: GlowButtonProps) {
  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]',
    secondary:
      'bg-transparent border border-blue-400/50 text-blue-300 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    danger:
      'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]',
  };

  return (
    <motion.button
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={
        pulse
          ? {
              boxShadow: [
                '0 0 20px rgba(59,130,246,0.5)',
                '0 0 30px rgba(59,130,246,0.7)',
                '0 0 20px rgba(59,130,246,0.5)',
              ],
            }
          : {}
      }
      transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
}
