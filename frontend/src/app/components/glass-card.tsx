import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowBorder?: boolean;
}

export function GlassCard({ children, className = '', glowBorder = true }: GlassCardProps) {
  return (
    <div
      className={`
      backdrop-blur-xl bg-white/5 rounded-2xl p-6
      ${glowBorder ? 'border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border border-white/5'}
      ${className}
    `}
    >
      {children}
    </div>
  );
}
