import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('save-settings', settings),
  openEditor: (path: string) => ipcRenderer.invoke('open-editor', path),
  gitPush: (path: string) => ipcRenderer.invoke('git-push', path),
  ghCreateRemote: (path: string, name: string, isPrivate: boolean) =>
    ipcRenderer.invoke('gh-create-remote', path, name, isPrivate),
  createProject: (name: string, initGit: boolean) =>
    ipcRenderer.invoke('create-project', name, initGit),
  refreshProject: (path: string) => ipcRenderer.invoke('refresh-project', path),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
});
