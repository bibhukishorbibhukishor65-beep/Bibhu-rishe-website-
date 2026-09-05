import React, { useState } from 'react';
import { 
  Film, 
  RefreshCw, 
  MessageSquare, 
  Mic, 
  Music, 
  Eye, 
  MapPin, 
  Compass, 
  Volume2, 
  Sun,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { StoryPackage, RegenerateAspect } from '../types.ts';

interface StoryboardViewerProps {
  story: StoryPackage;
  onRegenerate: (aspect: RegenerateAspect, sceneNumber?: number) => void;
  isRegenerating: boolean;
}

export const StoryboardViewer: React.FC<StoryboardViewerProps> = ({
  story,
  onRegenerate,
  isRegenerating
}) => {
  const [expandedScene, setExpandedScene] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      {/* Global Story & Soundscape Header Bar */}
      <div className="bg-[#0d1017] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>Cinematic Storyboard & Scene Architecture</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {story.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {story.logline}
            </p>
          </div>

          {/* Project-wide Music Regeneration Control */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-white/[0.03] border border-white/[0.06] p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Soundtrack</div>
                <div className="text-xs font-bold text-white">{story.musicMood} Score</div>
              </div>
            </div>
            <button
              onClick={() => onRegenerate('music')}
              disabled={isRegenerating}
              className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate background music"
            >
              <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regen Music</span>
            </button>
          </div>
        </div>

        {/* Narrative Arc Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-semibold">Act I • Beginning</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{story.beginning}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] uppercase tracking-wider font-mono text-blue-400 font-semibold">Act II • Middle</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{story.middle}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] uppercase tracking-wider font-mono text-purple-400 font-semibold">Act III • Climax</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{story.ending}</div>
          </div>
        </div>
      </div>

      {/* Sequential Scene Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Scene Breakdown ({story.scenes.length} Scenes)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click any scene to inspect or regenerate
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {story.scenes.map((scene) => {
            const isExpanded = expandedScene === scene.sceneNumber;
            return (
              <div
                key={scene.sceneNumber}
                className={`bg-[#0d1017] border rounded-3xl transition-all overflow-hidden ${
                  isExpanded ? 'border-cyan-500/40 shadow-xl shadow-cyan-500/5 ring-1 ring-cyan-500/20' : 'border-white/[0.07] hover:border-white/[0.12]'
                }`}
              >
                {/* Scene Header Strip */}
                <div
                  onClick={() => setExpandedScene(isExpanded ? null : scene.sceneNumber)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                      #{scene.sceneNumber}
                    </span>
                    <div>
                      <div className="text-base font-bold text-white">
                        {scene.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {scene.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Compass className="w-3 h-3 text-cyan-400" />
                          {scene.cameraShot}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">
                          {scene.durationSeconds}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Scene-level Regeneration Shortcuts */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerate('scene', scene.sceneNumber);
                      }}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Regenerate entire scene"
                    >
                      <RefreshCw className={`w-3 h-3 text-cyan-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>Regen Scene</span>
                    </button>

                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Scene Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-white/[0.06] bg-black/20 space-y-5">
                    {/* Visual Prompt & Camera Specification */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Visual Composition & 3D Staging</span>
                        </span>
                        <button
                          onClick={() => onRegenerate('visual', scene.sceneNumber)}
                          disabled={isRegenerating}
                          className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Regenerate Visual</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl leading-relaxed">
                        {scene.visualDescription}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Camera Movement</span>
                          <span className="text-slate-300 font-medium">{scene.cameraMovement}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Lighting</span>
                          <span className="text-slate-300 font-medium">{scene.lighting}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Weather & Atmosphere</span>
                          <span className="text-slate-300 font-medium">{scene.weather}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scene Action */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
                        Scene Action
                      </span>
                      <p className="text-xs text-slate-300 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl leading-relaxed">
                        {scene.action}
                      </p>
                    </div>

                    {/* Dialogue Exchanges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>Spoken Dialogue</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onRegenerate('dialogue', scene.sceneNumber)}
                            disabled={isRegenerating}
                            className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Regen Dialogue</span>
                          </button>
                          <button
                            onClick={() => onRegenerate('voice', scene.sceneNumber)}
                            disabled={isRegenerating}
                            className="text-[11px] font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Mic className="w-2.5 h-2.5" />
                            <span>Regen Voice</span>
                          </button>
                        </div>
                      </div>

                      {scene.dialogue && scene.dialogue.length > 0 ? (
                        <div className="space-y-2">
                          {scene.dialogue.map((line) => {
                            const speakerChar = story.characters.find(c => c.id === line.characterId);
                            const voiceName = speakerChar?.voiceName || "Zephyr";
                            return (
                              <div
                                key={line.id}
                                className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3"
                              >
                                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Mic className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-white">
                                      {line.characterName}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      {voiceName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 italic">
                                      ({line.emotion})
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-200 italic">
                                    "{line.text}"
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] text-xs text-slate-500 italic">
                          No spoken dialogue in this scene (Pure visual cinematic transition).
                        </div>
                      )}
                    </div>

                    {/* Foley & Sound Effects */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Foley & Sound Effects</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.soundEffects && scene.soundEffects.map((sfx, sidx) => (
                          <span
                            key={sidx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono"
                          >
                            {sfx}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
