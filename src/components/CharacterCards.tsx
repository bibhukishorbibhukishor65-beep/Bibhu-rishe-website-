import React from 'react';
import { Users, Sparkles, Mic, UserCheck } from 'lucide-react';
import type { Character } from '../types.ts';

interface CharacterCardsProps {
  characters: Character[];
}

export const CharacterCards: React.FC<CharacterCardsProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-bold text-white">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Persistent Character Identities ({characters.length})</span>
        </div>
        <span className="text-xs text-slate-400">
          Visual continuity & voice assignments
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((char) => (
          <div
            key={char.id}
            className="p-4 rounded-3xl bg-[#0d1017] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-inner"
                  style={{ backgroundColor: `${char.colorTone || '#38bdf8'}25`, border: `1px solid ${char.colorTone || '#38bdf8'}60` }}
                >
                  <UserCheck className="w-4 h-4" style={{ color: char.colorTone || '#38bdf8' }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {char.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {char.role}
                  </span>
                </div>
              </div>

              {/* Voice Tag */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
                <Mic className="w-3 h-3 text-purple-400" />
                <span>{char.voiceName}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Appearance</span>
                <p className="line-clamp-2 leading-relaxed text-slate-300">{char.appearance}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Attire / Signature Look</span>
                <p className="line-clamp-2 leading-relaxed text-slate-300">{char.clothing}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block font-semibold">Personality</span>
                <p className="line-clamp-1 text-slate-400">{char.personality}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
