import { useState } from 'react';
import { Star, ExternalLink, Upload, GitBranch } from 'lucide-react';
import clsx from 'clsx';
import { Project, ProjectSettings, TabDefinition } from '../types';
import StatusIndicator from './StatusIndicator';
import TagBadge from './TagBadge';
import ContextMenu, { MenuItem } from './ContextMenu';

interface ProjectRowProps {
  project: Project;
  settings?: ProjectSettings;
  tabs: TabDefinition[];
  selected?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onTogglePin: (path: string) => void;
  onPush: (path: string) => Promise<{ success: boolean; message: string }>;
  onCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string }>;
  onAssignToTab: (path: string, tabId: string | undefined) => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ProjectRow({
  project,
  settings,
  tabs,
  selected,
  onSelect,
  onDoubleClick,
  onTogglePin,
  onPush,
  onCreateRemote,
  onAssignToTab,
}: ProjectRowProps) {
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isPinned = settings?.pinned ?? false;
  const tags = settings?.tags ?? [];
  const currentTabId = settings?.tabId;

  // Filter out "All Projects" tab for the submenu
  const userTabs = tabs.filter(t => t.id !== 'all');

  async function handlePush(e: React.MouseEvent) {
    e.stopPropagation();
    setActionLoading(true);
    await onPush(project.path);
    setActionLoading(false);
  }

  async function handleCreateRemote(e: React.MouseEvent) {
    e.stopPropagation();
    setActionLoading(true);
    await onCreateRemote(project.path, project.name, false);
    setActionLoading(false);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }

  const contextMenuItems: MenuItem[] = [
    {
      label: 'Open in Editor',
      onClick: onDoubleClick,
    },
    {
      label: isPinned ? 'Unpin from Favorites' : 'Pin to Favorites',
      onClick: () => onTogglePin(project.path),
    },
    { separator: true },
    {
      label: 'Move to Tab',
      submenu: [
        {
          label: 'None',
          checked: !currentTabId,
          onClick: () => onAssignToTab(project.path, undefined),
        },
        ...(userTabs.length > 0 ? [{ separator: true }] : []),
        ...userTabs.map(tab => ({
          label: tab.name,
          checked: currentTabId === tab.id,
          onClick: () => onAssignToTab(project.path, tab.id),
        })),
      ],
    },
  ];

  // Add git actions if applicable
  if (project.status.isGitRepo) {
    if (!project.status.hasRemote) {
      contextMenuItems.push({
        label: 'Create GitHub Remote',
        onClick: () => handleCreateRemote({ stopPropagation: () => {} } as React.MouseEvent),
      });
    } else if (project.status.ahead > 0) {
      contextMenuItems.push({
        label: `Push (${project.status.ahead} commit${project.status.ahead > 1 ? 's' : ''})`,
        onClick: () => handlePush({ stopPropagation: () => {} } as React.MouseEvent),
      });
    }
  }

  return (
    <>
      <div
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={clsx(
          'group flex items-center h-[28px] px-3 cursor-default transition-colors text-[13px]',
          selected
            ? 'bg-[#0058d0] text-white'
            : 'hover:bg-[#3d3d3d] text-[#e5e5e5]'
        )}
      >
        {/* Pin indicator */}
        <div className="w-5 flex-shrink-0">
          {isPinned && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-[150px] truncate flex items-center gap-2">
          <span className={selected ? 'text-white' : 'text-white'}>{project.name}</span>
        </div>

        {/* Status */}
        <div className="w-[100px] flex-shrink-0">
          <StatusIndicator status={project.status} compact selected={selected} />
        </div>

        {/* Branch */}
        <div className={clsx(
          'w-[100px] flex-shrink-0 truncate text-xs flex items-center gap-1',
          selected ? 'text-white/80' : 'text-[#8e8e93]'
        )}>
          {project.status.branch && (
            <>
              <GitBranch className="w-3 h-3" />
              {project.status.branch}
            </>
          )}
        </div>

        {/* Modified */}
        <div className={clsx(
          'w-[80px] flex-shrink-0 text-xs',
          selected ? 'text-white/80' : 'text-[#8e8e93]'
        )}>
          {formatRelativeTime(project.status.lastModified)}
        </div>

        {/* Tags */}
        <div className="w-[120px] flex-shrink-0 flex items-center gap-1 overflow-hidden">
          {tags.slice(0, 2).map(tag => (
            <TagBadge key={tag} tag={tag} small />
          ))}
          {tags.length > 2 && (
            <span className={clsx('text-xs', selected ? 'text-white/60' : 'text-[#8e8e93]')}>
              +{tags.length - 2}
            </span>
          )}
        </div>

        {/* Actions (shown on hover) */}
        <div className={clsx(
          'w-[80px] flex-shrink-0 flex items-center justify-end gap-1 transition-opacity',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          {project.status.isGitRepo && !project.status.hasRemote && (
            <button
              onClick={handleCreateRemote}
              disabled={actionLoading}
              className={clsx(
                'p-1 rounded transition-colors',
                selected ? 'hover:bg-white/20' : 'hover:bg-[#555]'
              )}
              title="Create GitHub remote"
            >
              <GitBranch className="w-3.5 h-3.5" />
            </button>
          )}
          {project.status.isGitRepo && project.status.hasRemote && project.status.ahead > 0 && (
            <button
              onClick={handlePush}
              disabled={actionLoading}
              className={clsx(
                'p-1 rounded transition-colors',
                selected ? 'hover:bg-white/20' : 'hover:bg-[#555]'
              )}
              title="Push to remote"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(project.path);
            }}
            className={clsx(
              'p-1 rounded transition-colors',
              selected ? 'hover:bg-white/20' : 'hover:bg-[#555]'
            )}
            title={isPinned ? 'Unpin' : 'Pin to favorites'}
          >
            <Star className={clsx('w-3.5 h-3.5', isPinned && 'fill-current text-yellow-500')} />
          </button>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
