import fs from "fs";
import path from "path";
import type { ProjectRecord } from "../src/types.ts";

const PROJECTS_FILE = path.join(process.cwd(), "storage", "projects", "projects.json");

export async function loadProjects(): Promise<ProjectRecord[]> {
  try {
    await fs.promises.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }
    const data = await fs.promises.readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(data) as ProjectRecord[];
  } catch (err) {
    console.error("Error loading projects:", err);
    return [];
  }
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  try {
    const list = await loadProjects();
    const existingIndex = list.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      list[existingIndex] = project;
    } else {
      list.unshift(project);
    }
    await fs.promises.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
    await fs.promises.writeFile(PROJECTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving project:", err);
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const list = await loadProjects();
    const filtered = list.filter(p => p.id !== id);
    await fs.promises.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error deleting project:", err);
    return false;
  }
}
