import * as fs from 'node:fs';
import * as path from 'node:path';
import { getGitStatus, GitStatus } from './git-service';

export interface ProjectStatus extends GitStatus {
  lastModified: Date;
}

export interface Project {
  path: string;
  name: string;
  status: ProjectStatus;
}

export async function scanProjects(mainCodeFolder: string): Promise<Project[]> {
  if (!mainCodeFolder || !fs.existsSync(mainCodeFolder)) {
    return [];
  }

  const entries = fs.readdirSync(mainCodeFolder, { withFileTypes: true });
  const projects: Project[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue; // Skip hidden folders

    const projectPath = path.join(mainCodeFolder, entry.name);

    try {
      const gitStatus = await getGitStatus(projectPath);
      const stats = fs.statSync(projectPath);

      projects.push({
        path: projectPath,
        name: entry.name,
        status: {
          ...gitStatus,
          lastModified: stats.mtime,
        },
      });
    } catch (error) {
      console.error(`Failed to scan project ${entry.name}:`, error);
    }
  }

  return projects;
}

export async function getProjectStatus(projectPath: string): Promise<Project | null> {
  if (!fs.existsSync(projectPath)) {
    return null;
  }

  try {
    const gitStatus = await getGitStatus(projectPath);
    const stats = fs.statSync(projectPath);
    const name = path.basename(projectPath);

    return {
      path: projectPath,
      name,
      status: {
        ...gitStatus,
        lastModified: stats.mtime,
      },
    };
  } catch (error) {
    console.error(`Failed to get project status for ${projectPath}:`, error);
    return null;
  }
}

export function createProjectFolder(
  mainCodeFolder: string,
  name: string
): { success: boolean; path?: string; message: string } {
  if (!mainCodeFolder) {
    return { success: false, message: 'No code folder configured' };
  }

  // Validate name (no special characters except - and _)
  if (!/^[\w-]+$/.test(name)) {
    return {
      success: false,
      message: 'Project name can only contain letters, numbers, hyphens, and underscores',
    };
  }

  const projectPath = path.join(mainCodeFolder, name);

  if (fs.existsSync(projectPath)) {
    return { success: false, message: 'A folder with this name already exists' };
  }

  try {
    fs.mkdirSync(projectPath, { recursive: true });
    return { success: true, path: projectPath, message: 'Project created' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create folder',
    };
  }
}
