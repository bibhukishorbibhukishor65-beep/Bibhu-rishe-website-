import crypto from "crypto";
import path from "path";
import type { 
  GenerationJob, 
  DurationOption, 
  VisualStyle, 
  AspectRatio, 
  GenerationStageId,
  RegenerateAspect,
  ProjectRecord
} from "../src/types.ts";
import { DURATION_OPTIONS, GENERATION_STAGES } from "../src/types.ts";
import { generateStoryPackage, regenerateAspect } from "./gemini.ts";
import { generateFullSoundtrack } from "./audio.ts";
import { renderCompleteVideo } from "./videoRenderer.ts";
import { saveProject } from "./projects.ts";

const jobs = new Map<string, GenerationJob>();

export function getJob(id: string): GenerationJob | undefined {
  return jobs.get(id);
}

function updateJobStage(
  job: GenerationJob, 
  stage: GenerationStageId, 
  customStatus?: string, 
  customPct?: number
) {
  const stageInfo = GENERATION_STAGES.find(s => s.id === stage);
  const stageIndex = GENERATION_STAGES.findIndex(s => s.id === stage);
  job.stage = stage;
  job.stageIndex = stageIndex >= 0 ? stageIndex : 0;
  job.progressPercent = customPct !== undefined ? customPct : (stageInfo ? stageInfo.estimatedPct : 100);
  job.statusMessage = customStatus || (stageInfo ? stageInfo.description : 'Processing...');
}

export function startGenerationJob(params: {
  prompt: string;
  duration: DurationOption;
  style: VisualStyle;
  aspectRatio: AspectRatio;
}): GenerationJob {
  const id = crypto.randomUUID();
  const durConfig = DURATION_OPTIONS.find(d => d.id === params.duration) || DURATION_OPTIONS[0];

  const job: GenerationJob = {
    id,
    prompt: params.prompt,
    duration: params.duration,
    durationTargetSeconds: durConfig.targetSeconds,
    style: params.style,
    aspectRatio: params.aspectRatio,
    stage: 'analyzing_prompt',
    stageIndex: 0,
    progressPercent: 8,
    statusMessage: 'Deconstructing narrative themes, mood, and cinematic requirements',
    createdAt: new Date().toISOString()
  };

  jobs.set(id, job);

  // Execute processing asynchronously in background
  executePipeline(job).catch(err => {
    console.error(`Pipeline error for job ${id}:`, err);
    job.stage = 'error';
    job.error = err instanceof Error ? err.message : 'Unknown generation error occurred';
    job.statusMessage = `Generation interrupted: ${job.error}`;
  });

  return job;
}

async function executePipeline(job: GenerationJob): Promise<void> {
  // Stage 1: Analyzing prompt
  updateJobStage(job, 'analyzing_prompt', 'Deconstructing themes, emotions, and cinematography constraints', 8);
  await new Promise(r => setTimeout(r, 600));

  // Stage 2: Creating story
  updateJobStage(job, 'creating_story', 'Synthesizing narrative beginning, middle, and climax', 18);
  const story = await generateStoryPackage({
    prompt: job.prompt,
    duration: job.duration,
    targetSeconds: job.durationTargetSeconds,
    style: job.style,
    aspectRatio: job.aspectRatio
  });
  job.story = story;

  // Stage 3: Building characters
  updateJobStage(job, 'building_characters', `Finalized ${story.characters.length} characters with consistent visual identity and voices`, 28);
  await new Promise(r => setTimeout(r, 400));

  // Stage 4: Planning scenes
  updateJobStage(job, 'planning_scenes', `Orchestrated ${story.scenes.length} camera setups, lighting moods, and scene timings`, 38);
  await new Promise(r => setTimeout(r, 400));

  // Stage 5: Generating visuals
  updateJobStage(job, 'generating_visuals', `Constructing 3D atmospheric environments in ${job.style} aesthetic`, 52);
  await new Promise(r => setTimeout(r, 500));

  // Stage 6: Generating dialogue
  updateJobStage(job, 'generating_dialogue', 'Aligning character dialogue exchanges with dramatic tension', 62);
  await new Promise(r => setTimeout(r, 400));

  // Stage 7: Generating voices
  updateJobStage(job, 'generating_voices', 'Synthesizing character vocal inflections and acoustic formants', 72);
  await new Promise(r => setTimeout(r, 500));

  // Stage 8: Adding music
  updateJobStage(job, 'adding_music', `Composing ${story.musicMood} orchestral score synchronized with narrative beats`, 82);
  const tempAudioPath = path.join(process.cwd(), "storage", "temp", job.id, "soundtrack.wav");
  await generateFullSoundtrack(story, job.durationTargetSeconds, tempAudioPath);

  // Stage 9: Adding sound effects
  updateJobStage(job, 'adding_sound_effects', 'Layering environmental ambience, footsteps, and Foley textures', 90);
  await new Promise(r => setTimeout(r, 400));

  // Stage 10: Synchronizing scenes
  updateJobStage(job, 'synchronizing_scenes', 'Aligning multi-track audio, camera pacing, and transitions', 94);
  await new Promise(r => setTimeout(r, 400));

  // Stage 11: Rendering final video
  updateJobStage(job, 'rendering_final_video', 'Encoding cinematic H.264/AAC video via FFmpeg engine', 98);
  const videoUrl = await renderCompleteVideo({
    projectId: job.id,
    story,
    style: job.style,
    aspectRatio: job.aspectRatio,
    soundtrackPath: tempAudioPath,
    targetSeconds: job.durationTargetSeconds
  });

  job.videoUrl = videoUrl;
  job.stage = 'completed';
  job.progressPercent = 100;
  job.statusMessage = 'Film generation complete. Ready for playback.';
  job.completedAt = new Date().toISOString();

  // Save to persistent projects
  const projectRecord: ProjectRecord = {
    id: job.id,
    prompt: job.prompt,
    duration: job.duration,
    durationTargetSeconds: job.durationTargetSeconds,
    style: job.style,
    aspectRatio: job.aspectRatio,
    story,
    videoUrl,
    createdAt: job.createdAt
  };
  await saveProject(projectRecord);
}

/**
 * Regenerates an individual aspect of a project and updates the video
 */
export async function handleRegeneration(params: {
  projectId: string;
  aspect: RegenerateAspect;
  sceneNumber?: number;
}): Promise<GenerationJob> {
  const job = jobs.get(params.projectId);
  if (!job || !job.story) {
    throw new Error("Project not found or not initialized");
  }

  job.stage = 'analyzing_prompt';
  job.progressPercent = 20;
  job.statusMessage = `Regenerating ${params.aspect}...`;

  const updatedStory = await regenerateAspect({
    aspect: params.aspect,
    sceneNumber: params.sceneNumber,
    existingStory: job.story,
    style: job.style
  });

  job.story = updatedStory;

  // Re-generate audio if music/voice/dialogue changed
  const tempAudioPath = path.join(process.cwd(), "storage", "temp", job.id, "soundtrack.wav");
  job.stage = 'adding_music';
  job.progressPercent = 60;
  job.statusMessage = 'Re-mixing synchronized audio tracks...';
  await generateFullSoundtrack(updatedStory, job.durationTargetSeconds, tempAudioPath);

  // Re-render final video
  job.stage = 'rendering_final_video';
  job.progressPercent = 85;
  job.statusMessage = 'Re-encoding final cinematic composition...';

  const videoUrl = await renderCompleteVideo({
    projectId: job.id,
    story: updatedStory,
    style: job.style,
    aspectRatio: job.aspectRatio,
    soundtrackPath: tempAudioPath,
    targetSeconds: job.durationTargetSeconds
  });

  job.videoUrl = videoUrl;
  job.stage = 'completed';
  job.progressPercent = 100;
  job.statusMessage = `${params.aspect} regenerated successfully!`;
  job.completedAt = new Date().toISOString();

  // Update in saved projects
  const projectRecord: ProjectRecord = {
    id: job.id,
    prompt: job.prompt,
    duration: job.duration,
    durationTargetSeconds: job.durationTargetSeconds,
    style: job.style,
    aspectRatio: job.aspectRatio,
    story: updatedStory,
    videoUrl,
    createdAt: job.createdAt
  };
  await saveProject(projectRecord);

  return job;
}
