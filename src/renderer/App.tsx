import { useState, useEffect, useCallback } from 'react';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ProjectList from './components/ProjectList';
import SettingsModal from './components/SettingsModal';
import NewProjectModal from './components/NewProjectModal';
import EditorCommandModal from './components/EditorCommandModal';
import SetupWizard from './components/SetupWizard';
import { useTabs } from './hooks/useTabs';
import { Project, Settings as SettingsType } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editorCommandProject, setEditorCommandProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);

  const handleSettingsChange = useCallback(async (newSettings: SettingsType) => {
    await window.electronAPI.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    createTab,
    renameTab,
    deleteTab,
    assignProjectToTab,
    getProjectsForTab,
  } = useTabs(settings, handleSettingsChange);

  useEffect(() => {
    checkFirstRun();
  }, []);

  async function checkFirstRun() {
    const firstRun = await window.electronAPI.isFirstRun();
    setIsFirstRun(firstRun);
    if (!firstRun) {
      loadData();
    }
  }

  async function handleSetupComplete() {
    setIsFirstRun(false);
    loadData();
  }

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

  async function handleOpenProject(path: string) {
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
    handleSettingsChange(newSettings);
  }

  function handleSetEditorCommand(path: string, editorCommand: string | undefined) {
    if (!settings) return;
    const projectSettings = settings.projects[path] || { pinned: false, order: 0, tags: [] };
    const newSettings = {
      ...settings,
      projects: {
        ...settings.projects,
        [path]: { ...projectSettings, editorCommand },
      },
    };
    handleSettingsChange(newSettings);
    setEditorCommandProject(null);
  }

  function handleOpenEditorCommandModal(path: string) {
    const project = projects.find(p => p.path === path);
    if (project) {
      setEditorCommandProject(project);
    }
  }

  function handleSidebarProjectSelect(path: string | null) {
    setSelectedProject(path);
  }

  function getFilteredProjects(): Project[] {
    // First filter by tab
    const projectPaths = projects.map(p => p.path);
    const tabFilteredPaths = getProjectsForTab(activeTabId, projectPaths);
    let filtered = projects.filter(p => tabFilteredPaths.includes(p.path));

    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    return filtered;
  }

  // Show setup wizard on first run
  if (isFirstRun === null) {
    return (
      <div className="min-h-screen bg-[#2d2d2d] flex items-center justify-center">
        <div className="text-[#8e8e93]">Loading...</div>
      </div>
    );
  }

  if (isFirstRun) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2d2d2d] flex items-center justify-center">
        <div className="text-[#8e8e93]">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#2d2d2d] overflow-hidden">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={deleteTab}
        onTabRename={renameTab}
        onNewTab={() => createTab()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          settings={settings}
          selectedProject={selectedProject}
          filterTag={null}
          onProjectSelect={handleSidebarProjectSelect}
          onFilterTagChange={() => {}}
        />

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <Toolbar
            onRefresh={handleRefresh}
            onNewProject={() => setShowNewProject(true)}
            onOpenSettings={() => setShowSettings(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Error Banner */}
          {error && (
            <div className="mx-3 mt-3 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Project List */}
          <div className="flex-1 overflow-hidden">
            <ProjectList
              projects={getFilteredProjects()}
              settings={settings}
              tabs={tabs}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              onOpenProject={handleOpenProject}
              onTogglePin={handleTogglePin}
              onPush={handlePush}
              onCreateRemote={handleCreateRemote}
              onAssignToTab={assignProjectToTab}
              onSetEditorCommand={handleOpenEditorCommandModal}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {editorCommandProject && settings && (
        <EditorCommandModal
          projectName={editorCommandProject.name}
          currentCommand={settings.projects[editorCommandProject.path]?.editorCommand}
          globalCommand={settings.editorCommand}
          onSave={(command) => handleSetEditorCommand(editorCommandProject.path, command)}
          onClose={() => setEditorCommandProject(null)}
        />
      )}
    </div>
  );
}
