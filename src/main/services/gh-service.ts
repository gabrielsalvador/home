import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function isGhInstalled(): Promise<boolean> {
  try {
    await execAsync('gh --version');
    return true;
  } catch {
    return false;
  }
}

export async function isGhAuthenticated(): Promise<boolean> {
  try {
    await execAsync('gh auth status');
    return true;
  } catch {
    return false;
  }
}

export async function createGitHubRepo(
  projectPath: string,
  name: string,
  isPrivate: boolean
): Promise<{ success: boolean; message: string; url?: string }> {
  // Check if gh is installed
  if (!(await isGhInstalled())) {
    return {
      success: false,
      message: 'GitHub CLI (gh) is not installed. Install it from https://cli.github.com/',
    };
  }

  // Check if authenticated
  if (!(await isGhAuthenticated())) {
    return {
      success: false,
      message: 'Not authenticated with GitHub. Run "gh auth login" in terminal.',
    };
  }

  try {
    const visibility = isPrivate ? '--private' : '--public';
    const { stdout } = await execAsync(
      `gh repo create ${name} ${visibility} --source=. --remote=origin --push`,
      { cwd: projectPath }
    );

    // Extract URL from output
    const urlMatch = stdout.match(/https:\/\/github\.com\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : undefined;

    return {
      success: true,
      message: 'Repository created and pushed to GitHub',
      url,
    };
  } catch (error: any) {
    // Check if remote already exists
    if (error.message?.includes('already exists')) {
      return {
        success: false,
        message: 'A remote named "origin" already exists',
      };
    }

    return {
      success: false,
      message: error.stderr || error.message || 'Failed to create repository',
    };
  }
}

export async function addRemoteAndPush(
  projectPath: string,
  remoteUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectPath });
    await execAsync('git push -u origin HEAD', { cwd: projectPath });
    return {
      success: true,
      message: 'Remote added and pushed successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.stderr || error.message || 'Failed to add remote',
    };
  }
}
