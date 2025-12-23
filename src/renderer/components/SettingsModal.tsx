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
      <div className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d3d3d]">
          <h2 className="text-sm font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#999] hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999] mb-1.5">
              Code Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mainCodeFolder}
                onChange={(e) => setMainCodeFolder(e.target.value)}
                placeholder="/path/to/your/code"
                className="flex-1 px-3 py-1.5 bg-[#1e1e1e] border border-[#555] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0058d0]"
              />
              <button
                onClick={handleSelectFolder}
                className="px-3 py-1.5 bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#555] rounded text-[#999] hover:text-white transition-colors"
                title="Browse"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#666] mt-1">
              The folder containing all your project directories
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#999] mb-1.5">
              Editor Command
            </label>
            <input
              type="text"
              value={editorCommand}
              onChange={(e) => setEditorCommand(e.target.value)}
              placeholder="cursor $folder_path"
              className="w-full px-3 py-1.5 bg-[#1e1e1e] border border-[#555] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0058d0]"
            />
            <p className="text-[11px] text-[#666] mt-1">
              Use <code className="bg-[#3d3d3d] px-1 rounded text-[#999]">$folder_path</code> as placeholder
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#3d3d3d]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-[#999] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-[#0058d0] hover:bg-[#0066f5] text-white text-sm rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
