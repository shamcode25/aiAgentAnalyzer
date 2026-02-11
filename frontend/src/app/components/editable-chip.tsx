import React from 'react';

interface EditableChipProps {
  label: string;
  value: string;
}

export function EditableChip({ label, value }: EditableChipProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="px-3 py-2 bg-white/5 border border-blue-400/30 rounded-lg text-sm text-gray-200 hover:border-blue-400/50 transition-colors duration-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
        {value}
      </div>
    </div>
  );
}
