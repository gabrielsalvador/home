import { useState } from 'react';
import { ChevronUp, ChevronDown, FolderOpen } from 'lucide-react';
import clsx from 'clsx';
import { Project, Settings, TabDefinition } from '../types';
import ProjectRow from './ProjectRow';

type SortField = 'name' | 'status' | 'branch' | 'modified';
type SortDirection = 'asc' | 'desc';

interface ProjectListProps {
  projects: Project[];
  settings: Settings | null;
  tabs: TabDefinition[];
  selectedProject: string | null;
  onSelectProject: (path: string | null) => void;
  onOpenProject: (path: string) => void;
  onTogglePin: (path: string) => void;
  onPush: (path: string) => Promise<{ success: boolean; message: string }>;
  onCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string }>;
  onAssignToTab: (path: string, tabId: string | undefined) => void;
  onSetEditorCommand: (path: string) => void;
}

interface ColumnHeaderProps {
  label: string;
  field: SortField;
  width: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function ColumnHeader({ label, field, width, sortField, sortDirection, onSort }: ColumnHeaderProps) {
  const isActive = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={clsx(
        'flex items-center gap-1 text-xs font-medium transition-colors',
        width,
        isActive ? 'text-white' : 'text-[#8e8e93] hover:text-white'
      )}
    >
      {label}
      {isActive && (
        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );
}

export default function ProjectList({
  projects,
  settings,
  tabs,
  selectedProject,
  onSelectProject,
  onOpenProject,
  onTogglePin,
  onPush,
  onCreateRemote,
  onAssignToTab,
  onSetEditorCommand,
}: ProjectListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function getSortedProjects(): Project[] {
    const pinnedProjects = projects.filter(p => settings?.projects[p.path]?.pinned);
    const unpinnedProjects = projects.filter(p => !settings?.projects[p.path]?.pinned);

    const sortProjects = (list: Project[]) => {
      return [...list].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'status':
            const getStatusOrder = (p: Project) => {
              if (!p.status.isGitRepo) return 5;
              if (!p.status.hasRemote) return 4;
              if (p.status.hasChanges) return 3;
              if (p.status.ahead > 0) return 2;
              if (p.status.behind > 0) return 1;
              return 0;
            };
            comparison = getStatusOrder(a) - getStatusOrder(b);
            break;
          case 'branch':
            comparison = (a.status.branch || '').localeCompare(b.status.branch || '');
            break;
          case 'modified':
            comparison = new Date(b.status.lastModified).getTime() - new Date(a.status.lastModified).getTime();
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    };

    return [...sortProjects(pinnedProjects), ...sortProjects(unpinnedProjects)];
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#8e8e93]">
        <FolderOpen className="w-12 h-12 mb-4" />
        <p className="text-lg mb-2">No projects in this tab</p>
        <p className="text-sm">Right-click a project to move it here, or check "All Projects" tab.</p>
      </div>
    );
  }

  const sortedProjects = getSortedProjects();

  return (
    <div className="flex flex-col h-full">
      {/* Column Headers */}
      <div className="flex items-center h-[24px] px-3 bg-[#2d2d2d] border-b border-[#3d3d3d] text-[#8e8e93] sticky top-0">
        <div className="w-5 flex-shrink-0" /> {/* Pin column */}
        <ColumnHeader label="Name" field="name" width="flex-1 min-w-[150px]" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
        <ColumnHeader label="Status" field="status" width="w-[100px]" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
        <ColumnHeader label="Branch" field="branch" width="w-[100px]" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
        <ColumnHeader label="Modified" field="modified" width="w-[80px]" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
        <div className="w-[120px] flex-shrink-0 text-xs font-medium">Tags</div>
        <div className="w-[80px] flex-shrink-0" /> {/* Actions column */}
      </div>

      {/* Project Rows */}
      <div className="flex-1 overflow-y-auto">
        {sortedProjects.map((project) => (
          <ProjectRow
            key={project.path}
            project={project}
            settings={settings?.projects[project.path]}
            tabs={tabs}
            selected={selectedProject === project.path}
            onSelect={() => onSelectProject(project.path)}
            onDoubleClick={() => onOpenProject(project.path)}
            onTogglePin={onTogglePin}
            onPush={onPush}
            onCreateRemote={onCreateRemote}
            onAssignToTab={onAssignToTab}
            onSetEditorCommand={onSetEditorCommand}
          />
        ))}
      </div>
    </div>
  );
}
