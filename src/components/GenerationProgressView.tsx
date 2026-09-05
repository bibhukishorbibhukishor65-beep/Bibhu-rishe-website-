import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  Sparkles, 
  Clapperboard,
  Film,
  Music,
  Mic,
  Palette,
  Layers,
  Wand2
} from 'lucide-react';
import type { GenerationJob, GenerationStageId } from '../types.ts';
import { GENERATION_STAGES } from '../types.ts';

interface GenerationProgressViewProps {
  job: GenerationJob;
}

const STAGE_ICONS: Record<GenerationStageId, React.ElementType> = {
  analyzing_prompt: Sparkles,
  creating_story: Clapperboard,
  building_characters: Wand2,
  planning_scenes: Layers,
  generating_visuals: Palette,
  generating_dialogue: Mic,
  generating_voices: Mic,
  adding_music: Music,
  adding_sound_effects: Music,
  synchronizing_scenes: Film,
  rendering_final_video: Film,
  completed: CheckCircle2,
  error: Circle,
};

export const GenerationProgressView: React.FC<GenerationProgressViewProps> = ({ job }) => {
  const currentStageIndex = GENERATION_STAGES.findIndex(s => s.id === job.stage);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div className="w-full bg-[#0d1017] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Cinematic Film Synthesis In Progress
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {job.statusMessage}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 rounded-2xl self-start sm:self-auto font-mono">
          <div className="text-right">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Progress</div>
            <div className="text-xl font-bold text-cyan-400">{Math.min(100, Math.round(job.progressPercent))}%</div>
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2.5 bg-black/40 border border-white/[0.06] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/20"
            style={{ width: `${Math.max(4, Math.min(100, job.progressPercent))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>Stage {activeIndex + 1} of {GENERATION_STAGES.length}</span>
          <span>Target Duration: {job.durationTargetSeconds}s</span>
        </div>
      </div>

      {/* Sequential Pipeline Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
        {GENERATION_STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex || job.stage === 'completed';
          const isCurrent = idx === activeIndex && job.stage !== 'completed';
          const isPending = idx > activeIndex && job.stage !== 'completed';
          const Icon = STAGE_ICONS[stage.id] || Film;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-white/[0.02] border-emerald-500/30 text-slate-300'
                  : isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20 text-white'
                  : 'bg-white/[0.01] border-white/[0.04] text-slate-500 opacity-60'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-cyan-300' : isDone ? 'text-slate-200' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {isCurrent ? job.statusMessage : stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
