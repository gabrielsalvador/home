import { app } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Bootstrap config - stored in Electron's userData, points to settings.json location
interface BootstrapConfig {
  settingsPath: string;
}

export interface ProjectSettings {
  pinned: boolean;
  order: number;
  tags: string[];
  tabId?: string;
}

export interface TabDefinition {
  id: string;
  name: string;
  order: number;
}

export interface Settings {
  mainCodeFolder: string;
  editorCommand: string;
  projects: Record<string, ProjectSettings>;
  tabs: TabDefinition[];
  activeTabId?: string;
}

const DEFAULT_SETTINGS: Settings = {
  mainCodeFolder: process.env.MAIN_CODE_FOLDER || '',
  editorCommand: 'cursor $folder_path',
  projects: {},
  tabs: [],
  activeTabId: 'all',
};

// Bootstrap config lives in Electron's userData (machine-specific, not synced)
function getBootstrapPath(): string {
  return path.join(app.getPath('userData'), 'bootstrap.json');
}

export function loadBootstrap(): BootstrapConfig | null {
  const bootstrapPath = getBootstrapPath();
  try {
    if (fs.existsSync(bootstrapPath)) {
      const data = fs.readFileSync(bootstrapPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load bootstrap config:', error);
  }
  return null;
}

export function saveBootstrap(config: BootstrapConfig): void {
  const bootstrapPath = getBootstrapPath();
  try {
    const dir = path.dirname(bootstrapPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(bootstrapPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save bootstrap config:', error);
    throw error;
  }
}

export function isFirstRun(): boolean {
  const bootstrap = loadBootstrap();
  return !bootstrap || !bootstrap.settingsPath;
}

export function getSettingsLocation(): string | null {
  const bootstrap = loadBootstrap();
  return bootstrap?.settingsPath || null;
}

export function setSettingsLocation(folderPath: string): void {
  const settingsPath = path.join(folderPath, 'settings.json');
  saveBootstrap({ settingsPath });

  // Create settings.json with defaults if it doesn't exist
  if (!fs.existsSync(settingsPath)) {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

function getSettingsPath(): string | null {
  const bootstrap = loadBootstrap();
  return bootstrap?.settingsPath || null;
}

export function loadSettings(): Settings {
  const settingsPath = getSettingsPath();

  if (!settingsPath) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed, tabs: parsed.tabs || [] };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
  const settingsPath = getSettingsPath();

  if (!settingsPath) {
    throw new Error('Settings location not configured');
  }

  try {
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

export function getDefaultSettingsFolder(): string {
  return app.getPath('userData');
}
