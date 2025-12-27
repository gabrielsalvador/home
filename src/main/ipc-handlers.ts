import { ipcMain, dialog } from 'electron';
import { spawn } from 'node:child_process';
import { loadSettings, saveSettings, Settings } from './services/settings-service';
import { scanProjects, getProjectStatus, createProjectFolder } from './services/project-scanner';
import { gitPush, gitInit } from './services/git-service';
import { createGitHubRepo } from './services/gh-service';

export function registerIpcHandlers(): void {
  // Get all projects
  ipcMain.handle('get-projects', async () => {
    const settings = loadSettings();
    return scanProjects(settings.mainCodeFolder);
  });

  // Get settings
  ipcMain.handle('get-settings', async () => {
    return loadSettings();
  });

  // Save settings
  ipcMain.handle('save-settings', async (_, settings: Settings) => {
    saveSettings(settings);
  });

  // Open project in editor
  ipcMain.handle('open-editor', async (_, projectPath: string) => {
    const settings = loadSettings();
    const editorCommand = settings.editorCommand || 'cursor $folder_path';

    try {
      // Use macOS 'open' command with -a flag for apps, which integrates properly with Apple Events
      // This avoids race conditions that can occur with direct spawn + detached mode
      if (process.platform === 'darwin') {
        // Check if the command is a simple app name (e.g., "cursor", "code") or a full command
        const parts = editorCommand.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const program = parts[0].toLowerCase();

        // Common editors that work well with 'open -a'
        const appNames: Record<string, string> = {
          'cursor': 'Cursor',
          'code': 'Visual Studio Code',
          'zed': 'Zed',
          'sublime': 'Sublime Text',
          'atom': 'Atom',
          'webstorm': 'WebStorm',
          'phpstorm': 'PhpStorm',
          'idea': 'IntelliJ IDEA',
        };

        const appName = appNames[program];
        if (appName) {
          // Use 'open -a AppName path' for known apps
          spawn('open', ['-a', appName, projectPath], {
            stdio: 'ignore',
          });
        } else {
          // Fall back to executing the command directly for custom commands
          const command = editorCommand.replace('$folder_path', `"${projectPath}"`);
          spawn('sh', ['-c', command], {
            stdio: 'ignore',
          });
        }
      } else {
        // Non-macOS: use the original approach
        const command = editorCommand.replace('$folder_path', projectPath);
        const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const program = parts[0];
        const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

        spawn(program, args, {
          detached: true,
          stdio: 'ignore',
          shell: true,
        }).unref();
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  });

  // Git push
  ipcMain.handle('git-push', async (_, projectPath: string) => {
    return gitPush(projectPath);
  });

  // Create GitHub remote
  ipcMain.handle('gh-create-remote', async (_, projectPath: string, name: string, isPrivate: boolean) => {
    return createGitHubRepo(projectPath, name, isPrivate);
  });

  // Create new project
  ipcMain.handle('create-project', async (_, name: string, initGit: boolean) => {
    const settings = loadSettings();
    const result = createProjectFolder(settings.mainCodeFolder, name);

    if (result.success && initGit && result.path) {
      const gitResult = await gitInit(result.path);
      if (!gitResult.success) {
        return { ...result, message: `Folder created but git init failed: ${gitResult.message}` };
      }
    }

    return result;
  });

  // Refresh single project
  ipcMain.handle('refresh-project', async (_, projectPath: string) => {
    return getProjectStatus(projectPath);
  });

  // Select folder dialog
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });
}
