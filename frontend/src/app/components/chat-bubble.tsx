import React from 'react';

interface ChatBubbleProps {
  message: string;
  sender: 'user' | 'agent';
  timestamp?: string;
}

export function ChatBubble({ message, sender, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
          sender === 'agent'
            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-gray-200'
            : 'bg-white/10 text-gray-300'
        }`}
      >
        <p>{message}</p>
        {timestamp && <p className="text-xs text-gray-500 mt-1">{timestamp}</p>}
      </div>
    </div>
  );
}
