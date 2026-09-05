export type DurationOption = '10s' | '15s' | '20s' | '10m' | '15m' | '20m';

export interface DurationConfig {
  id: DurationOption;
  label: string;
  targetSeconds: number;
  badge?: string;
  description: string;
}

export const DURATION_OPTIONS: DurationConfig[] = [
  { id: '10s', label: '10 seconds', targetSeconds: 10, description: 'Quick cinematic teaser (2 scenes)' },
  { id: '15s', label: '15 seconds', targetSeconds: 15, description: 'Dramatic short clip (3 scenes)' },
  { id: '20s', label: '20 seconds', targetSeconds: 20, description: 'Extended cinematic scene (4 scenes)' },
  { id: '10m', label: '10 minutes', targetSeconds: 600, badge: 'Long Film', description: 'Full episode with multi-scene arc' },
  { id: '15m', label: '15 minutes', targetSeconds: 900, badge: 'Epic Arc', description: 'Deep narrative storytelling' },
  { id: '20m', label: '20 minutes', targetSeconds: 1200, badge: 'Feature Short', description: 'Complete cinematic mini-feature' },
];

export type VisualStyle = 
  | 'Cinematic 3D'
  | 'Realistic'
  | 'Animated 3D'
  | 'Fantasy'
  | 'Sci-Fi'
  | 'Cartoon'
  | 'Anime-inspired';

export const VISUAL_STYLES: { id: VisualStyle; description: string; accent: string }[] = [
  { id: 'Cinematic 3D', description: 'Unreal Engine 5 style volumetric lighting & raytracing', accent: 'from-amber-500/20 to-orange-500/10' },
  { id: 'Realistic', description: 'Hyper-realistic cinema camera depth of field & natural tones', accent: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'Animated 3D', description: 'High-end studio 3D character animation with rich textures', accent: 'from-purple-500/20 to-pink-500/10' },
  { id: 'Fantasy', description: 'Ethereal atmosphere, magical particle glows & mythical mood', accent: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'Sci-Fi', description: 'Futuristic holograms, neon cyber-aesthetics & dark metallic sheen', accent: 'from-cyan-500/20 to-blue-600/10' },
  { id: 'Cartoon', description: 'Vibrant expressive stylized rendering with bold outlines', accent: 'from-yellow-500/20 to-amber-500/10' },
  { id: 'Anime-inspired', description: 'Hand-crafted animation aesthetic, dramatic lighting & emotion', accent: 'from-rose-500/20 to-red-500/10' },
];

export type AspectRatio = '16:9' | '9:16' | '1:1';

export const ASPECT_RATIOS: { id: AspectRatio; label: string; icon: string; width: number; height: number }[] = [
  { id: '16:9', label: '16:9 (Landscape)', icon: 'Monitor', width: 1280, height: 720 },
  { id: '9:16', label: '9:16 (Portrait)', icon: 'Smartphone', width: 720, height: 1280 },
  { id: '1:1', label: '1:1 (Square)', icon: 'Square', width: 720, height: 720 },
];

export interface Character {
  id: string;
  name: string;
  role: string;
  appearance: string;
  clothing: string;
  personality: string;
  voiceName: string;
  voicePitch?: string;
  colorTone: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  emotion: string;
}

export interface ScenePlan {
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  location: string;
  environment: string;
  lighting: string;
  weather: string;
  cameraShot: string;
  cameraMovement: string;
  characterIds: string[];
  action: string;
  dialogue: DialogueLine[];
  soundEffects: string[];
  visualDescription: string;
  visualUrl?: string;
  clipVideoUrl?: string;
}

export interface StoryPackage {
  title: string;
  logline: string;
  beginning: string;
  middle: string;
  ending: string;
  musicMood: 'Emotional' | 'Adventure' | 'Suspense' | 'Fantasy' | 'Comedy' | 'Dramatic' | 'Peaceful' | 'Cinematic';
  musicTempo: string;
  soundscapeAmbience: string;
  characters: Character[];
  scenes: ScenePlan[];
}

export type GenerationStageId =
  | 'analyzing_prompt'
  | 'creating_story'
  | 'building_characters'
  | 'planning_scenes'
  | 'generating_visuals'
  | 'generating_dialogue'
  | 'generating_voices'
  | 'adding_music'
  | 'adding_sound_effects'
  | 'synchronizing_scenes'
  | 'rendering_final_video'
  | 'completed'
  | 'error';

export interface StageInfo {
  id: GenerationStageId;
  label: string;
  description: string;
  estimatedPct: number;
}

export const GENERATION_STAGES: StageInfo[] = [
  { id: 'analyzing_prompt', label: 'Analyzing prompt', description: 'Deconstructing narrative themes, mood, and cinematic requirements', estimatedPct: 8 },
  { id: 'creating_story', label: 'Creating story', description: 'Crafting coherent beginning, middle, and climax', estimatedPct: 18 },
  { id: 'building_characters', label: 'Building characters', description: 'Establishing consistent visual identity, attire, and voices', estimatedPct: 28 },
  { id: 'planning_scenes', label: 'Planning scenes', description: 'Configuring camera shots, lighting, and pacing per scene', estimatedPct: 38 },
  { id: 'generating_visuals', label: 'Generating visuals', description: 'Rendering 3D environments, character composition, and depth', estimatedPct: 52 },
  { id: 'generating_dialogue', label: 'Generating dialogue', description: 'Composing in-character dialogue aligned with narrative tension', estimatedPct: 62 },
  { id: 'generating_voices', label: 'Generating voices', description: 'Synthesizing character voice acting with emotional inflection', estimatedPct: 72 },
  { id: 'adding_music', label: 'Adding music', description: 'Composing synchronized background score matching the mood', estimatedPct: 82 },
  { id: 'adding_sound_effects', label: 'Adding sound effects', description: 'Foley layering: ambience, weather, footsteps, and spatial impacts', estimatedPct: 90 },
  { id: 'synchronizing_scenes', label: 'Synchronizing scenes', description: 'Aligning audio tracks, dialogue timing, and camera transitions', estimatedPct: 94 },
  { id: 'rendering_final_video', label: 'Rendering final video', description: 'FFmpeg high-bitrate encoding with cinematic color grade', estimatedPct: 98 },
];

export interface GenerationJob {
  id: string;
  prompt: string;
  duration: DurationOption;
  durationTargetSeconds: number;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  stage: GenerationStageId;
  stageIndex: number;
  progressPercent: number;
  statusMessage: string;
  error?: string;
  story?: StoryPackage;
  videoUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ProjectRecord {
  id: string;
  prompt: string;
  duration: DurationOption;
  durationTargetSeconds: number;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  story: StoryPackage;
  videoUrl: string;
  createdAt: string;
}

export type RegenerateAspect = 'scene' | 'dialogue' | 'voice' | 'music' | 'visual';
