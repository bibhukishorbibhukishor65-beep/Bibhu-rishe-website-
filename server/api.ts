import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { startGenerationJob, getJob, handleRegeneration } from "./jobs.ts";
import { loadProjects, deleteProject } from "./projects.ts";

export const apiRouter = Router();

// Start generation job
apiRouter.post("/generate", (req: Request, res: Response) => {
  try {
    const { prompt, duration, style, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }
    const job = startGenerationJob({
      prompt: prompt.trim(),
      duration: duration || "10s",
      style: style || "Cinematic 3D",
      aspectRatio: aspectRatio || "16:9"
    });
    res.json({ success: true, id: job.id, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to start generation" });
  }
});

// Check job status
apiRouter.get("/jobs/:id", (req: Request, res: Response) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({ job });
});

// Regenerate specific aspect
apiRouter.post("/regenerate", async (req: Request, res: Response) => {
  try {
    const { projectId, aspect, sceneNumber } = req.body;
    if (!projectId || !aspect) {
      res.status(400).json({ error: "projectId and aspect are required" });
      return;
    }
    const updatedJob = await handleRegeneration({
      projectId,
      aspect,
      sceneNumber: sceneNumber ? parseInt(sceneNumber, 10) : undefined
    });
    res.json({ success: true, job: updatedJob });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to regenerate" });
  }
});

// Get project history
apiRouter.get("/projects", async (_req: Request, res: Response) => {
  try {
    const projects = await loadProjects();
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch projects" });
  }
});

// Delete a project
apiRouter.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const success = await deleteProject(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete project" });
  }
});

// Stream MP4 video with HTTP 206 Range support for scrubbing
apiRouter.get("/videos/:filename", (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const videoPath = path.join(process.cwd(), "storage", "videos", filename);

  if (!fs.existsSync(videoPath)) {
    res.status(404).send("Video file not found");
    return;
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});
