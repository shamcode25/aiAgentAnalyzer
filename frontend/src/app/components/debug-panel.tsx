import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DebugPanelProps {
  data: unknown;
  metadata?: {
    model?: string;
    latency?: string;
    requestId?: string;
  };
}

export function DebugPanel({ data, metadata }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl bg-white/5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors duration-300"
      >
        <span className="text-sm text-gray-300">Debug Intelligence Panel</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {metadata && (
              <div className="px-4 py-3 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                {metadata.model && (
                  <div>
                    <div className="text-gray-500">Model</div>
                    <div className="text-gray-300">{metadata.model}</div>
                  </div>
                )}
                {metadata.latency && (
                  <div>
                    <div className="text-gray-500">Latency</div>
                    <div className="text-gray-300">{metadata.latency}</div>
                  </div>
                )}
                {metadata.requestId && (
                  <div>
                    <div className="text-gray-500">Request ID</div>
                    <div className="text-gray-300">{metadata.requestId}</div>
                  </div>
                )}
              </div>
            )}
            <div className="px-4 py-3 border-t border-white/10">
              <pre className="text-xs text-gray-300 overflow-x-auto font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
