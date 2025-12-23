import { useState } from 'react';
import { Star, ExternalLink, Upload, GitBranch, Plus, GripVertical, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Project, ProjectSettings } from '../types';
import StatusIndicator from './StatusIndicator';
import TagBadge from './TagBadge';

interface ProjectCardProps {
  project: Project;
  settings?: ProjectSettings;
  onOpenEditor: (path: string) => void;
  onTogglePin: (path: string) => void;
  onPush: (path: string) => Promise<{ success: boolean; message: string }>;
  onCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string }>;
  onUpdateTags: (path: string, tags: string[]) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ProjectCard({
  project,
  settings,
  onOpenEditor,
  onTogglePin,
  onPush,
  onCreateRemote,
  onUpdateTags,
  isDragging,
  dragHandleProps,
}: ProjectCardProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isPinned = settings?.pinned ?? false;
  const tags = settings?.tags ?? [];

  async function handlePush() {
    setActionLoading('push');
    setActionMessage(null);
    try {
      const result = await onPush(project.path);
      setActionMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  }

  async function handleCreateRemote() {
    setActionLoading('remote');
    setActionMessage(null);
    try {
      const result = await onCreateRemote(project.path, project.name, false);
      setActionMessage({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  }

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdateTags(project.path, [...tags, newTag.trim()]);
    }
    setNewTag('');
    setShowTagInput(false);
  }

  function handleRemoveTag(tag: string) {
    onUpdateTags(
      project.path,
      tags.filter((t) => t !== tag)
    );
  }

  return (
    <div
      className={clsx(
        'bg-slate-800 border border-slate-700 rounded-lg p-4 transition-all',
        isDragging && 'opacity-50 shadow-lg',
        isPinned && 'border-l-4 border-l-yellow-500'
      )}
    >
      <div className="flex items-start gap-3">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 mt-1">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate">{project.name}</h3>
            <button
              onClick={() => onTogglePin(project.path)}
              className={clsx(
                'p-1 rounded transition-colors',
                isPinned ? 'text-yellow-500 hover:text-yellow-400' : 'text-slate-500 hover:text-slate-300'
              )}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Star className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="text-xs text-slate-500 truncate mb-2" title={project.path}>
            {project.path}
          </p>

          <div className="flex items-center gap-3 mb-3">
            <StatusIndicator status={project.status} />
            {project.status.branch && (
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <GitBranch className="w-3 h-3" />
                {project.status.branch}
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-500 text-xs" title={`Last modified: ${new Date(project.status.lastModified).toLocaleString()}`}>
              <Clock className="w-3 h-3" />
              {formatRelativeTime(project.status.lastModified)}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
            ))}
            {showTagInput ? (
              <form onSubmit={handleAddTag} className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag name"
                  className="w-20 px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  onBlur={() => {
                    if (!newTag.trim()) setShowTagInput(false);
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 hover:text-white border border-dashed border-slate-600 rounded-full hover:border-slate-400 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Tag
              </button>
            )}
          </div>

          {actionMessage && (
            <div
              className={clsx(
                'text-xs mb-2 px-2 py-1 rounded',
                actionMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              )}
            >
              {actionMessage.text}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onOpenEditor(project.path)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            title="Open in editor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </button>

          {project.status.isGitRepo && !project.status.hasRemote && (
            <button
              onClick={handleCreateRemote}
              disabled={actionLoading === 'remote'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-slate-600 text-white text-xs rounded transition-colors"
              title="Create GitHub remote"
            >
              {actionLoading === 'remote' ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <GitBranch className="w-3.5 h-3.5" />
              )}
              Create Remote
            </button>
          )}

          {project.status.isGitRepo && project.status.hasRemote && project.status.ahead > 0 && (
            <button
              onClick={handlePush}
              disabled={actionLoading === 'push'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-600 text-white text-xs rounded transition-colors"
              title="Push to remote"
            >
              {actionLoading === 'push' ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Push
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
