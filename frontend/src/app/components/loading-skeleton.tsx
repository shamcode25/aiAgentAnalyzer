import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white/10 rounded shimmer" />
              <div className="h-5 w-32 bg-white/10 rounded shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded shimmer w-full" />
              <div className="h-4 bg-white/10 rounded shimmer w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
