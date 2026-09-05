import React from 'react';
import { Palette, Maximize2, Monitor, Smartphone, Square } from 'lucide-react';
import type { VisualStyle, AspectRatio } from '../types.ts';
import { VISUAL_STYLES, ASPECT_RATIOS } from '../types.ts';

interface StyleAndRatioSelectorProps {
  selectedStyle: VisualStyle;
  selectedRatio: AspectRatio;
  onStyleChange: (style: VisualStyle) => void;
  onRatioChange: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

export const StyleAndRatioSelector: React.FC<StyleAndRatioSelectorProps> = ({
  selectedStyle,
  selectedRatio,
  onStyleChange,
  onRatioChange,
  disabled
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Style Selector */}
      <div className="lg:col-span-8 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Visual Style</span>
          </label>
          <span className="text-xs text-slate-400">
            Selected: <span className="text-cyan-300 font-medium">{selectedStyle}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {VISUAL_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                id={`style-opt-${style.id.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                disabled={disabled}
                onClick={() => onStyleChange(style.id)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[75px] ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#0d1017] hover:bg-[#11141f] border-white/[0.07] hover:border-white/[0.15]'
                }`}
              >
                <div className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {style.id}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-tight">
                  {style.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-base font-semibold text-white flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span>Aspect Ratio</span>
          </label>
          <span className="text-xs text-slate-400">
            Default: 16:9
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                id={`ratio-opt-${ratio.id.replace(':', '-')}`}
                type="button"
                disabled={disabled}
                onClick={() => onRatioChange(ratio.id)}
                className={`text-center p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[75px] ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/15 to-blue-500/5 border-cyan-500/60 ring-1 ring-cyan-500/30 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-[#0d1017] hover:bg-[#11141f] border-white/[0.07] hover:border-white/[0.15] text-slate-300'
                }`}
              >
                {ratio.id === '16:9' && <Monitor className="w-5 h-5 mb-1.5 text-cyan-400" />}
                {ratio.id === '9:16' && <Smartphone className="w-5 h-5 mb-1.5 text-cyan-400" />}
                {ratio.id === '1:1' && <Square className="w-5 h-5 mb-1.5 text-cyan-400" />}
                
                <span className="text-xs font-bold font-mono">{ratio.id}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {ratio.id === '16:9' ? 'Cinema' : ratio.id === '9:16' ? 'Vertical' : 'Square'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
