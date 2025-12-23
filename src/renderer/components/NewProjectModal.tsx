import { useState } from 'react';
import { X, GitBranch } from 'lucide-react';

interface NewProjectModalProps {
  onCreate: (name: string, initGit: boolean) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export default function NewProjectModal({ onCreate, onClose }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [initGit, setInitGit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onCreate(name.trim(), initGit);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d3d3d]">
          <h2 className="text-sm font-medium text-white">New Project</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#999] hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999] mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full px-3 py-1.5 bg-[#1e1e1e] border border-[#555] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0058d0]"
              autoFocus
            />
            <p className="text-[11px] text-[#666] mt-1">
              This will create a new folder in your code directory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="init-git"
              checked={initGit}
              onChange={(e) => setInitGit(e.target.checked)}
              className="w-4 h-4 bg-[#1e1e1e] border-[#555] rounded text-[#0058d0] focus:ring-[#0058d0] focus:ring-offset-[#2d2d2d]"
            />
            <label htmlFor="init-git" className="flex items-center gap-1.5 text-sm text-[#e5e5e5]">
              <GitBranch className="w-4 h-4 text-[#999]" />
              Initialize git repository
            </label>
          </div>

          {error && (
            <div className="p-2 bg-red-900/50 border border-red-700 rounded text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-[#999] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-3 py-1.5 bg-[#0058d0] hover:bg-[#0066f5] disabled:bg-[#555] disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
