import { app } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json');
}

export function loadSettings(): Settings {
  const settingsPath = getSettingsPath();

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
