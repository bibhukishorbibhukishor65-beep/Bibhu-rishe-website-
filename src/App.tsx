import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  RotateCcw, 
  Film,
  Play,
  Layers,
  Users,
  Video
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { PromptSection } from './components/PromptSection.tsx';
import { DurationSelector } from './components/DurationSelector.tsx';
import { StyleAndRatioSelector } from './components/StyleAndRatioSelector.tsx';
import { GenerationProgressView } from './components/GenerationProgressView.tsx';
import { VideoPlayer } from './components/VideoPlayer.tsx';
import { StoryboardViewer } from './components/StoryboardViewer.tsx';
import { CharacterCards } from './components/CharacterCards.tsx';
import { ProjectHistorySection } from './components/ProjectHistorySection.tsx';
import type { 
  DurationOption, 
  VisualStyle, 
  AspectRatio, 
  GenerationJob, 
  ProjectRecord,
  RegenerateAspect
} from './types.ts';

export default function App() {
  // Generation inputs
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<DurationOption>('10s');
  const [style, setStyle] = useState<VisualStyle>('Cinematic 3D');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Job & Results state
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectRecord | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History & saved projects
  const [history, setHistory] = useState<ProjectRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active view tab when video is ready: 'preview' | 'storyboard' | 'characters'
  const [activeTab, setActiveTab] = useState<'preview' | 'storyboard' | 'characters'>('preview');

  const pollingTimerRef = useRef<number | null>(null);

  // Fetch projects on initial mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects history:", err);
    }
  };

  // Start Generation Pipeline
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your story or video in the prompt box before generating.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          style,
          aspectRatio
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      setActiveJob(data.job);
      pollJobProgress(data.id);
    } catch (err: any) {
      setIsGenerating(false);
      setError(err.message || "An unexpected error occurred during video generation.");
    }
  };

  // Polling loop for background job progress
  const pollJobProgress = (jobId: string) => {
    if (pollingTimerRef.current) {
      window.clearInterval(pollingTimerRef.current);
    }

    pollingTimerRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;

        const data = await res.json();
        const job: GenerationJob = data.job;

        if (job) {
          setActiveJob(job);

          if (job.stage === 'completed') {
            window.clearInterval(pollingTimerRef.current!);
            setIsGenerating(false);

            if (job.story && job.videoUrl) {
              const projectRecord: ProjectRecord = {
                id: job.id,
                prompt: job.prompt,
                duration: job.duration,
                durationTargetSeconds: job.durationTargetSeconds,
                style: job.style,
                aspectRatio: job.aspectRatio,
                story: job.story,
                videoUrl: job.videoUrl,
                createdAt: job.createdAt
              };
              setCurrentProject(projectRecord);
              setActiveTab('preview');
              fetchProjects();
            }
          } else if (job.stage === 'error') {
            window.clearInterval(pollingTimerRef.current!);
            setIsGenerating(false);
            setError(job.error || "Generation encountered an unexpected failure.");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 750);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // Handle fine-grained regeneration
  const handleRegenerate = async (aspect: RegenerateAspect, sceneNumber?: number) => {
    if (!currentProject) return;
    setIsRegenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          aspect,
          sceneNumber
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Regeneration failed (${res.status})`);
      }

      const data = await res.json();
      if (data.job?.story && data.job?.videoUrl) {
        const updatedProject: ProjectRecord = {
          ...currentProject,
          story: data.job.story,
          videoUrl: data.job.videoUrl
        };
        setCurrentProject(updatedProject);
        fetchProjects();
      }
    } catch (err: any) {
      setError(err.message || "Failed to regenerate aspect.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Select project from history
  const handleSelectHistoryProject = (proj: ProjectRecord) => {
    setCurrentProject(proj);
    setPrompt(proj.prompt);
    setDuration(proj.duration);
    setStyle(proj.style);
    setAspectRatio(proj.aspectRatio);
    setActiveTab('preview');
  };

  // Delete project from history
  const handleDeleteHistoryProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#e8ecf4] flex flex-col antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Exact Branding Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">System Error Notice</h4>
              <p className="text-xs text-rose-200 mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-100 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Top Control Panel: Prompt & Configuration */}
        <div className="bg-[#0c0f17] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Prompt Box */}
          <PromptSection
            prompt={prompt}
            onChange={setPrompt}
            disabled={isGenerating}
          />

          {/* Video Duration Selection */}
          <DurationSelector
            selectedDuration={duration}
            onChange={setDuration}
            disabled={isGenerating}
          />

          {/* Visual Style & Aspect Ratio Selection */}
          <StyleAndRatioSelector
            selectedStyle={style}
            selectedRatio={aspectRatio}
            onStyleChange={setStyle}
            onRatioChange={setAspectRatio}
            disabled={isGenerating}
          />

          {/* Generate Button Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Full-pipeline AI video rendering with real-time FFmpeg assembly</span>
            </div>

            <button
              id="generate-video-btn"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                isGenerating || !prompt.trim()
                  ? 'bg-white/[0.05] border border-white/[0.08] text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-500/25 ring-1 ring-white/20 active:scale-[0.98]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? "Synthesizing Film..." : "Generate Video"}</span>
            </button>
          </div>
        </div>

        {/* Live Generation Progress Interface */}
        {isGenerating && activeJob && (
          <GenerationProgressView job={activeJob} />
        )}

        {/* Results Workspace: Video Preview, Storyboard & Characters */}
        {currentProject && currentProject.story && currentProject.videoUrl && (
          <div className="space-y-6">
            {/* View Switching Navigation Pills */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c0f17] border border-white/[0.08] w-fit">
              <button
                id="tab-preview-btn"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Preview</span>
              </button>

              <button
                id="tab-storyboard-btn"
                onClick={() => setActiveTab('storyboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'storyboard'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Storyboard & Scenes ({currentProject.story.scenes.length})</span>
              </button>

              <button
                id="tab-characters-btn"
                onClick={() => setActiveTab('characters')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'characters'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Characters ({currentProject.story.characters.length})</span>
              </button>
            </div>

            {/* Tab 1: Video Player Preview */}
            {activeTab === 'preview' && (
              <div className="space-y-8">
                <VideoPlayer
                  videoUrl={currentProject.videoUrl}
                  title={currentProject.story.title}
                  aspectRatio={currentProject.aspectRatio}
                />

                {/* Quick Story Synopsis Card */}
                <div className="bg-[#0c0f17] border border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <h4 className="text-base font-bold text-white">Cinematic Narrative Summary</h4>
                    <span className="text-xs text-cyan-400 font-mono">
                      {currentProject.style} • {currentProject.duration} Target
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentProject.story.logline}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Soundtrack Mood</span>
                      <span className="text-xs text-white font-medium">{currentProject.story.musicMood} ({currentProject.story.musicTempo})</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Scenes Mastered</span>
                      <span className="text-xs text-white font-medium">{currentProject.story.scenes.length} Scenes Connected</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block font-semibold">Cast Ensemble</span>
                      <span className="text-xs text-white font-medium">{currentProject.story.characters.map(c => c.name).join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Storyboard & Scene Planner */}
            {activeTab === 'storyboard' && (
              <StoryboardViewer
                story={currentProject.story}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
              />
            )}

            {/* Tab 3: Characters */}
            {activeTab === 'characters' && (
              <CharacterCards characters={currentProject.story.characters} />
            )}
          </div>
        )}
      </main>

      {/* Project History Modal */}
      <ProjectHistorySection
        projects={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectProject={handleSelectHistoryProject}
        onDeleteProject={handleDeleteHistoryProject}
        activeProjectId={currentProject?.id}
      />
    </div>
  );
}
