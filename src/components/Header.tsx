import React from 'react';
import { Film, History } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHistory, historyCount }) => {
  return (
    <header className="w-full border-b border-white/[0.06] bg-[#07080c]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Exact website name as required: ONLY "Bibhu kishor Jena" */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Film className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Bibhu kishor Jena
          </h1>
        </div>

        {/* History Access Button */}
        <div className="flex items-center gap-3">
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white transition-all text-sm font-medium cursor-pointer"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Project History</span>
            {historyCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
