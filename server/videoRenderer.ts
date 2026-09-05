import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import type { 
  ScenePlan, 
  VisualStyle, 
  AspectRatio, 
  Character, 
  StoryPackage 
} from "../src/types.ts";
import { getDimensions, generateSceneSvg } from "./visuals.ts";

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args);
    let stderr = "";

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error("FFmpeg error output:", stderr.slice(-800));
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-300)}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Builds cinematic zoom/pan filter based on camera motion type
 */
function getCameraMotionFilter(movement: string, width: number, height: number, durationSeconds: number): string {
  const fps = 25;
  const totalFrames = Math.max(25, Math.floor(durationSeconds * fps));

  if (movement.includes('push') || movement.includes('in') || movement.includes('Close-up')) {
    // Smooth cinematic push in
    return `scale=${width}:${height},zoompan=z='min(zoom+0.0008,1.2)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
  } else if (movement.includes('pan') || movement.includes('Tracking')) {
    // Slow cinematic pan
    return `scale=${width}:${height},zoompan=z=1.1:d=${totalFrames}:x='(iw-iw/zoom)*(on/${totalFrames})':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
  } else if (movement.includes('Crane') || movement.includes('down') || movement.includes('up')) {
    // Vertical tilt/crane
    return `scale=${width}:${height},zoompan=z=1.1:d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(on/${totalFrames})':s=${width}x${height}:fps=${fps}`;
  }

  // Default subtle atmospheric breathing zoom
  return `scale=${width}:${height},zoompan=z='min(zoom+0.0005,1.15)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
}

/**
 * Renders complete film by rendering scene clips and stitching with soundtrack
 */
export async function renderCompleteVideo(params: {
  projectId: string;
  story: StoryPackage;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  soundtrackPath: string;
  targetSeconds: number;
}): Promise<string> {
  const { projectId, story, style, aspectRatio, soundtrackPath, targetSeconds } = params;
  const tempDir = path.join(process.cwd(), "storage", "temp", projectId);
  const outputDir = path.join(process.cwd(), "storage", "videos");
  await fs.promises.mkdir(tempDir, { recursive: true });
  await fs.promises.mkdir(outputDir, { recursive: true });

  const finalVideoPath = path.join(outputDir, `${projectId}.mp4`);
  const { width, height } = getDimensions(aspectRatio);

  const clipPaths: string[] = [];
  const concatListPath = path.join(tempDir, "concat.txt");

  // Determine effective rendering time for preview clip
  // For UI preview and quick playback, clamp each scene between 3s and 6s
  // so generation finishes promptly while maintaining correct scene pacing and narrative continuity
  const sceneRenderSeconds = Math.min(6, Math.max(3, Math.round(targetSeconds / (story.scenes.length || 1))));

  for (let i = 0; i < story.scenes.length; i++) {
    const scene = story.scenes[i];
    const svgContent = generateSceneSvg(scene, style, aspectRatio, story.characters);
    const svgPath = path.join(tempDir, `scene_${scene.sceneNumber}.svg`);
    const clipPath = path.join(tempDir, `clip_${scene.sceneNumber}.mp4`);

    await fs.promises.writeFile(svgPath, svgContent, "utf-8");

    const vf = getCameraMotionFilter(scene.cameraMovement, width, height, sceneRenderSeconds);

    await runFfmpeg([
      "-loop", "1",
      "-i", svgPath,
      "-vf", `${vf},format=yuv420p`,
      "-c:v", "libx264",
      "-t", sceneRenderSeconds.toString(),
      "-pix_fmt", "yuv420p",
      "-r", "25",
      clipPath,
      "-y"
    ]);

    clipPaths.push(clipPath);
  }

  // Create concat file
  const concatContent = clipPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.promises.writeFile(concatListPath, concatContent, "utf-8");

  // Stitch video clips and mux with synthesized soundtrack
  const totalVideoDuration = sceneRenderSeconds * story.scenes.length;

  await runFfmpeg([
    "-f", "concat",
    "-safe", "0",
    "-i", concatListPath,
    "-i", soundtrackPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "-movflags", "+faststart",
    finalVideoPath,
    "-y"
  ]);

  // Clean up intermediate temp files safely in background
  fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});

  return `/api/videos/${projectId}.mp4`;
}
