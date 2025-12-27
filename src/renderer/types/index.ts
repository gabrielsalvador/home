export interface ProjectStatus {
  isGitRepo: boolean;
  hasRemote: boolean;
  remoteName?: string;
  remoteUrl?: string;
  branch?: string;
  ahead: number;
  behind: number;
  hasChanges: boolean;
  lastModified: Date;
  lastSynced?: Date;
}

export interface Project {
  path: string;
  name: string;
  status: ProjectStatus;
}

export interface ProjectSettings {
  pinned: boolean;
  order: number;
  tags: string[];
  tabId?: string;  // Which tab this project belongs to (undefined = no specific tab)
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

export interface ElectronAPI {
  getProjects: () => Promise<Project[]>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<void>;
  openEditor: (path: string) => Promise<void>;
  gitPush: (path: string) => Promise<{ success: boolean; message: string }>;
  ghCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string; url?: string }>;
  createProject: (name: string, initGit: boolean) => Promise<{ success: boolean; path?: string; message: string }>;
  refreshProject: (path: string) => Promise<Project>;
  selectFolder: () => Promise<string | null>;
  // First-run setup
  isFirstRun: () => Promise<boolean>;
  setSettingsLocation: (folderPath: string) => Promise<void>;
  getSettingsLocation: () => Promise<string | null>;
  getDefaultSettingsFolder: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
