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
}

export interface Settings {
  mainCodeFolder: string;
  editorCommand: string;
  projects: Record<string, ProjectSettings>;
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
