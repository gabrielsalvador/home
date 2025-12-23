import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ProjectList from './components/ProjectList';
import Toolbar from './components/Toolbar';
import SettingsModal from './components/SettingsModal';
import NewProjectModal from './components/NewProjectModal';
import { Project, Settings as SettingsType } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, settingsData] = await Promise.all([
        window.electronAPI.getProjects(),
        window.electronAPI.getSettings(),
      ]);
      setProjects(projectsData);
      setSettings(settingsData);

      // Show settings modal if no main folder is set
      if (!settingsData.mainCodeFolder) {
        setShowSettings(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    await loadData();
  }

  async function handleSettingsSave(newSettings: SettingsType) {
    await window.electronAPI.saveSettings(newSettings);
    setSettings(newSettings);
    setShowSettings(false);
    await loadData();
  }

  async function handleNewProject(name: string, initGit: boolean) {
    const result = await window.electronAPI.createProject(name, initGit);
    if (result.success) {
      setShowNewProject(false);
      await loadData();
    }
    return result;
  }

  async function handleOpenEditor(path: string) {
    await window.electronAPI.openEditor(path);
  }

  async function handlePush(path: string) {
    const result = await window.electronAPI.gitPush(path);
    if (result.success) {
      await loadData();
    }
    return result;
  }

  async function handleCreateRemote(path: string, name: string, isPrivate: boolean) {
    const result = await window.electronAPI.ghCreateRemote(path, name, isPrivate);
    if (result.success) {
      await loadData();
    }
    return result;
  }

  function handleTogglePin(path: string) {
    if (!settings) return;
    const projectSettings = settings.projects[path] || { pinned: false, order: 0, tags: [] };
    const newSettings = {
      ...settings,
      projects: {
        ...settings.projects,
        [path]: { ...projectSettings, pinned: !projectSettings.pinned },
      },
    };
    handleSettingsSave(newSettings);
  }

  function handleUpdateTags(path: string, tags: string[]) {
    if (!settings) return;
    const projectSettings = settings.projects[path] || { pinned: false, order: 0, tags: [] };
    const newSettings = {
      ...settings,
      projects: {
        ...settings.projects,
        [path]: { ...projectSettings, tags },
      },
    };
    handleSettingsSave(newSettings);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    if (!settings) return;
    const sortedProjects = getSortedProjects();
    const movedProject = sortedProjects[fromIndex];

    const newProjects = { ...settings.projects };
    sortedProjects.forEach((project, index) => {
      const projectSettings = newProjects[project.path] || { pinned: false, order: 0, tags: [] };
      if (index === fromIndex) {
        newProjects[project.path] = { ...projectSettings, order: toIndex };
      } else if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
        newProjects[project.path] = { ...projectSettings, order: index - 1 };
      } else if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
        newProjects[project.path] = { ...projectSettings, order: index + 1 };
      }
    });

    handleSettingsSave({ ...settings, projects: newProjects });
  }

  function getSortedProjects(): Project[] {
    if (!settings) return projects;

    return [...projects].sort((a, b) => {
      const aSettings = settings.projects[a.path] || { pinned: false, order: Infinity, tags: [] };
      const bSettings = settings.projects[b.path] || { pinned: false, order: Infinity, tags: [] };

      // Pinned first
      if (aSettings.pinned !== bSettings.pinned) {
        return aSettings.pinned ? -1 : 1;
      }

      // Then by order
      return aSettings.order - bSettings.order;
    });
  }

  function getFilteredProjects(): Project[] {
    let filtered = getSortedProjects();

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    if (filterTag && settings) {
      filtered = filtered.filter(p => {
        const projectSettings = settings.projects[p.path];
        return projectSettings?.tags?.includes(filterTag);
      });
    }

    return filtered;
  }

  function getAllTags(): string[] {
    if (!settings) return [];
    const tags = new Set<string>();
    Object.values(settings.projects).forEach(p => {
      p.tags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Toolbar
        onRefresh={handleRefresh}
        onNewProject={() => setShowNewProject(true)}
        onOpenSettings={() => setShowSettings(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tags={getAllTags()}
        filterTag={filterTag}
        onFilterTagChange={setFilterTag}
      />

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <ProjectList
        projects={getFilteredProjects()}
        settings={settings}
        onOpenEditor={handleOpenEditor}
        onTogglePin={handleTogglePin}
        onPush={handlePush}
        onCreateRemote={handleCreateRemote}
        onUpdateTags={handleUpdateTags}
        onReorder={handleReorder}
      />

      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showNewProject && (
        <NewProjectModal
          onCreate={handleNewProject}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </div>
  );
}
