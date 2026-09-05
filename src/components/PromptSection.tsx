import React from 'react';
import { Sparkles, Clapperboard, Users, MapPin, Eye, MessageSquare, Compass, SunDim } from 'lucide-react';

interface PromptSectionProps {
  prompt: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const INSPIRATION_PROMPTS = [
  "A cyberpunk detective and an android companion uncover a glowing crystalline artifact beneath a rain-soaked neon metropolis.",
  "Deep sea research submersible exploring an abyssal trench encounters bioluminescent ancient architectural spires.",
  "A lone wanderer in heavy weathered explorer robes navigates a windy mountain crest at twilight while auroras fill the sky.",
  "An interstellar pilot waking from cryo-sleep on an orbital station as planetary rings rotate outside the panoramic observation deck."
];

const AI_CAPABILITIES = [
  { label: "Story Arc", icon: Clapperboard },
  { label: "Characters", icon: Users },
  { label: "Locations", icon: MapPin },
  { label: "Actions & Staging", icon: Eye },
  { label: "Emotions & Dialogue", icon: MessageSquare },
  { label: "Cinematic Camera", icon: Compass },
  { label: "Atmospheric Mood", icon: SunDim },
];

export const PromptSection: React.FC<PromptSectionProps> = ({ prompt, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label htmlFor="prompt-input" className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Story & Cinematic Prompt</span>
        </label>
        <span className="text-xs text-slate-400 font-mono">
          {prompt.length} characters
        </span>
      </div>

      <div className="relative group">
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Describe the story or video you want to create..."
          rows={4}
          className="w-full bg-[#0d1017] hover:bg-[#10131d] focus:bg-[#121520] border border-white/[0.08] focus:border-cyan-500/50 rounded-2xl p-4 sm:p-5 text-white placeholder:text-slate-500 text-base leading-relaxed resize-y min-h-[120px] transition-all outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
        />
      </div>

      {/* AI Automatic Understanding Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs text-slate-500 mr-1 font-medium">Auto-interprets:</span>
        {AI_CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          return (
            <span
              key={cap.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 font-normal"
            >
              <Icon className="w-3 h-3 text-cyan-400/80" />
              <span>{cap.label}</span>
            </span>
          );
        })}
      </div>

      {/* Inspiration Starters */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-medium text-slate-400">Try an inspiration prompt:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INSPIRATION_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChange(sample)}
              className="text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all line-clamp-2 cursor-pointer"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
