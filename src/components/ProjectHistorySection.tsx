import React from 'react';
import { 
  History, 
  Trash2, 
  Play, 
  Clock, 
  Calendar, 
  Palette, 
  Maximize2,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { ProjectRecord } from '../types.ts';

interface ProjectHistorySectionProps {
  projects: ProjectRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectRecord) => void;
  onDeleteProject: (id: string) => void;
  activeProjectId?: string;
}

export const ProjectHistorySection: React.FC<ProjectHistorySectionProps> = ({
  projects,
  isOpen,
  onClose,
  onSelectProject,
  onDeleteProject,
  activeProjectId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#0c0f17] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Saved Film Projects
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} in studio vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Projects List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {projects.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] mx-auto flex items-center justify-center text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No saved film projects yet.</p>
              <p className="text-xs text-slate-500">Generate your first video to start building your studio archive.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {projects.map((proj) => {
                const isActive = activeProjectId === proj.id;
                const formattedDate = new Date(proj.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isActive 
                        ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/5' 
                        : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-white truncate">
                          {proj.story?.title || "Untitled Project"}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {proj.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-slate-300">
                          {proj.style}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-400">
                          {proj.aspectRatio}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        "{proj.prompt}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span>{proj.story?.scenes?.length || 0} Scenes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => {
                          onSelectProject(proj);
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Reopen Project</span>
                      </button>

                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.06] hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
