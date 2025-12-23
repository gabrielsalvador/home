import { useCallback } from 'react';
import { TabDefinition, Settings } from '../types';

const ALL_PROJECTS_TAB: TabDefinition = {
  id: 'all',
  name: 'All Projects',
  order: -1,
};

export function useTabs(
  settings: Settings | null,
  onSettingsChange: (settings: Settings) => void
) {
  const tabs = settings?.tabs || [];
  const activeTabId = settings?.activeTabId || 'all';

  // All tabs including the fixed "All Projects" tab
  const allTabs: TabDefinition[] = [ALL_PROJECTS_TAB, ...tabs.sort((a, b) => a.order - b.order)];

  const activeTab = allTabs.find(t => t.id === activeTabId) || ALL_PROJECTS_TAB;

  const setActiveTabId = useCallback((tabId: string) => {
    if (!settings) return;
    onSettingsChange({ ...settings, activeTabId: tabId });
  }, [settings, onSettingsChange]);

  const createTab = useCallback((name = 'New Tab') => {
    if (!settings) return;
    const newTab: TabDefinition = {
      id: `tab-${Date.now()}`,
      name,
      order: tabs.length,
    };
    const newSettings = {
      ...settings,
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    };
    onSettingsChange(newSettings);
    return newTab;
  }, [settings, tabs, onSettingsChange]);

  const renameTab = useCallback((tabId: string, name: string) => {
    if (!settings || tabId === 'all') return;
    const newTabs = tabs.map(t => t.id === tabId ? { ...t, name } : t);
    onSettingsChange({ ...settings, tabs: newTabs });
  }, [settings, tabs, onSettingsChange]);

  const deleteTab = useCallback((tabId: string) => {
    if (!settings || tabId === 'all') return;

    // Remove tab
    const newTabs = tabs.filter(t => t.id !== tabId);

    // Clear tabId from all projects that were in this tab
    const newProjects = { ...settings.projects };
    Object.keys(newProjects).forEach(path => {
      if (newProjects[path].tabId === tabId) {
        newProjects[path] = { ...newProjects[path], tabId: undefined };
      }
    });

    // Switch to "All Projects" if we deleted the active tab
    const newActiveTabId = activeTabId === tabId ? 'all' : activeTabId;

    onSettingsChange({
      ...settings,
      tabs: newTabs,
      projects: newProjects,
      activeTabId: newActiveTabId,
    });
  }, [settings, tabs, activeTabId, onSettingsChange]);

  const assignProjectToTab = useCallback((projectPath: string, tabId: string | undefined) => {
    if (!settings) return;

    const projectSettings = settings.projects[projectPath] || { pinned: false, order: 0, tags: [] };
    const newSettings = {
      ...settings,
      projects: {
        ...settings.projects,
        [projectPath]: { ...projectSettings, tabId },
      },
    };
    onSettingsChange(newSettings);
  }, [settings, onSettingsChange]);

  const getProjectsForTab = useCallback((tabId: string, projectPaths: string[]): string[] => {
    if (!settings) return projectPaths;

    if (tabId === 'all') {
      return projectPaths; // All projects tab shows everything
    }

    return projectPaths.filter(path => {
      const projectSettings = settings.projects[path];
      return projectSettings?.tabId === tabId;
    });
  }, [settings]);

  return {
    tabs: allTabs,
    userTabs: tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    createTab,
    renameTab,
    deleteTab,
    assignProjectToTab,
    getProjectsForTab,
  };
}
