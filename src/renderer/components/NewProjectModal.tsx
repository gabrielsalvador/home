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
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">New Project</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1.5">
              This will create a new folder in your code directory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="init-git"
              checked={initGit}
              onChange={(e) => setInitGit(e.target.checked)}
              className="w-4 h-4 bg-slate-700 border-slate-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
            />
            <label htmlFor="init-git" className="flex items-center gap-1.5 text-sm text-slate-300">
              <GitBranch className="w-4 h-4" />
              Initialize git repository
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
