import React from 'react';

interface StatusBadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'routine' | 'urgent' | 'emergent';
  children: React.ReactNode;
  glow?: boolean;
}

export function StatusBadge({ variant = 'info', children, glow = true }: StatusBadgeProps) {
  const variants = {
    success: 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.4)]',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    danger: 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    routine: 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.4)]',
    urgent: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    emergent: 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider border ${variants[variant]} ${!glow ? 'shadow-none' : ''}`}
    >
      {children}
    </span>
  );
}
