import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';

const execAsync = promisify(exec);

export interface GitStatus {
  isGitRepo: boolean;
  hasRemote: boolean;
  remoteName?: string;
  remoteUrl?: string;
  branch?: string;
  ahead: number;
  behind: number;
  hasChanges: boolean;
  lastSynced?: Date;
}

async function runGitCommand(projectPath: string, command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, { cwd: projectPath });
    return stdout.trim();
  } catch {
    return '';
  }
}

export async function getGitStatus(projectPath: string): Promise<GitStatus> {
  const gitDir = path.join(projectPath, '.git');
  const isGitRepo = fs.existsSync(gitDir);

  if (!isGitRepo) {
    return {
      isGitRepo: false,
      hasRemote: false,
      ahead: 0,
      behind: 0,
      hasChanges: false,
    };
  }

  // Get remote info
  const remoteOutput = await runGitCommand(projectPath, 'git remote -v');
  const hasRemote = remoteOutput.length > 0;
  let remoteName: string | undefined;
  let remoteUrl: string | undefined;

  if (hasRemote) {
    const match = remoteOutput.match(/^(\S+)\s+(\S+)/);
    if (match) {
      remoteName = match[1];
      remoteUrl = match[2];
    }
  }

  // Get current branch
  const branch = await runGitCommand(projectPath, 'git rev-parse --abbrev-ref HEAD');

  // Get ahead/behind counts
  let ahead = 0;
  let behind = 0;

  if (hasRemote && branch) {
    const statusOutput = await runGitCommand(projectPath, 'git status -sb');
    const aheadBehindMatch = statusOutput.match(/\[ahead (\d+)(?:, behind (\d+))?\]|\[behind (\d+)\]/);
    if (aheadBehindMatch) {
      if (aheadBehindMatch[1]) ahead = parseInt(aheadBehindMatch[1], 10);
      if (aheadBehindMatch[2]) behind = parseInt(aheadBehindMatch[2], 10);
      if (aheadBehindMatch[3]) behind = parseInt(aheadBehindMatch[3], 10);
    }
  }

  // Check for uncommitted changes
  const statusOutput = await runGitCommand(projectPath, 'git status --porcelain');
  const hasChanges = statusOutput.length > 0;

  // Get last sync time (from FETCH_HEAD if it exists)
  let lastSynced: Date | undefined;
  const fetchHeadPath = path.join(projectPath, '.git', 'FETCH_HEAD');
  if (fs.existsSync(fetchHeadPath)) {
    try {
      const stats = fs.statSync(fetchHeadPath);
      lastSynced = stats.mtime;
    } catch {
      // ignore
    }
  }

  return {
    isGitRepo: true,
    hasRemote,
    remoteName,
    remoteUrl,
    branch,
    ahead,
    behind,
    hasChanges,
    lastSynced,
  };
}

export async function gitPush(projectPath: string): Promise<{ success: boolean; message: string }> {
  try {
    const { stdout, stderr } = await execAsync('git push', { cwd: projectPath });
    return {
      success: true,
      message: stdout || stderr || 'Pushed successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.stderr || error.message || 'Push failed',
    };
  }
}

export async function gitInit(projectPath: string): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync('git init', { cwd: projectPath });
    return { success: true, message: 'Git repository initialized' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to initialize git',
    };
  }
}
