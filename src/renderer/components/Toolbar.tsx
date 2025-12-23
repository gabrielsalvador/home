import { RefreshCw, Plus, Settings, Search, X } from 'lucide-react';
import clsx from 'clsx';

interface ToolbarProps {
  onRefresh: () => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tags: string[];
  filterTag: string | null;
  onFilterTagChange: (tag: string | null) => void;
}

export default function Toolbar({
  onRefresh,
  onNewProject,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  tags,
  filterTag,
  onFilterTagChange,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">Projects</h1>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full max-w-xs pl-9 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2">
            {filterTag && (
              <button
                onClick={() => onFilterTagChange(null)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700"
              >
                {filterTag}
                <X className="w-3 h-3" />
              </button>
            )}
            {!filterTag && (
              <select
                onChange={(e) => onFilterTagChange(e.target.value || null)}
                value={filterTag || ''}
                className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Filter by tag</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
