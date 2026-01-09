import React from 'react';
import { Cpu } from 'lucide-react';

export default function Logo({ size = 'default', showText = true }) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    default: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' }
  };

  const s = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl blur-sm opacity-60" />
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2">
          <Cpu className={`${s.icon} text-white`} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${s.text} font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight`}>
            REALTECH LABS
          </span>
          <span className="text-xs font-medium text-emerald-600 tracking-widest uppercase -mt-1">
            Job Hunter
          </span>
        </div>
      )}
    </div>
  );
}