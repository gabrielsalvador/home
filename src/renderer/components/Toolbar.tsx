import { RefreshCw, Plus, Settings, Search } from 'lucide-react';

interface ToolbarProps {
  onRefresh: () => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Toolbar({
  onRefresh,
  onNewProject,
  onOpenSettings,
  searchQuery,
  onSearchChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center h-[38px] px-3 bg-[#3d3d3d] border-b border-[#2a2a2a]">
      {/* Left side - actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onRefresh}
          className="p-1.5 text-[#999] hover:text-white hover:bg-[#555] rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onNewProject}
          className="p-1.5 text-[#999] hover:text-white hover:bg-[#555] rounded transition-colors"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side - search and settings */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[180px] pl-7 pr-2 py-1 bg-[#1e1e1e] border border-[#555] rounded text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#0058d0] focus:ring-1 focus:ring-[#0058d0]"
          />
        </div>
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-[#999] hover:text-white hover:bg-[#555] rounded transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
