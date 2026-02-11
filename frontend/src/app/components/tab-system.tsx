import React from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabSystem({ tabs, activeTab, onChange }: TabSystemProps) {
  return (
    <div className="flex gap-2 border-b border-white/10 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-sm transition-colors duration-300 ${
            activeTab === tab.id ? 'text-blue-300' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
