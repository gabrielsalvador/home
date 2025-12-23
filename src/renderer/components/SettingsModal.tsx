import { useState } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Settings } from '../types';

interface SettingsModalProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [mainCodeFolder, setMainCodeFolder] = useState(settings.mainCodeFolder);
  const [editorCommand, setEditorCommand] = useState(settings.editorCommand);

  async function handleSelectFolder() {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setMainCodeFolder(folder);
    }
  }

  function handleSave() {
    onSave({
      ...settings,
      mainCodeFolder,
      editorCommand,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Code Folder
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The folder containing all your project directories
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={mainCodeFolder}
                onChange={(e) => setMainCodeFolder(e.target.value)}
                placeholder="/path/to/your/code"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors"
                title="Browse"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Editor Command
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Command to open projects. Use <code className="bg-slate-700 px-1 rounded">$folder_path</code> as placeholder.
            </p>
            <input
              type="text"
              value={editorCommand}
              onChange={(e) => setEditorCommand(e.target.value)}
              placeholder="cursor $folder_path"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Examples: <code className="bg-slate-700 px-1 rounded">code $folder_path</code>, <code className="bg-slate-700 px-1 rounded">subl $folder_path</code>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
