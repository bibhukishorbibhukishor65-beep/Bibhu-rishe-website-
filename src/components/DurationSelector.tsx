import React from 'react';
import { Clock, Film, Sparkles } from 'lucide-react';
import type { DurationOption } from '../types.ts';
import { DURATION_OPTIONS } from '../types.ts';

interface DurationSelectorProps {
  selectedDuration: DurationOption;
  onChange: (duration: DurationOption) => void;
  disabled?: boolean;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Video Duration</span>
        </label>
        <span className="text-xs text-slate-400">
          Manual user selection required
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {DURATION_OPTIONS.map((opt) => {
          const isSelected = selectedDuration === opt.id;
          return (
            <button
              key={opt.id}
              id={`duration-opt-${opt.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`relative text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/15 to-blue-500/5 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-[#0d1017] hover:bg-[#11141f] border-white/[0.07] hover:border-white/[0.15]'
              }`}
            >
              {opt.badge && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {opt.badge}
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-mono">
                <Film className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Target</span>
              </div>

              <div>
                <div className={`text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {opt.label}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {opt.description}
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-x-3 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
