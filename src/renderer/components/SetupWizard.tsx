import { useState, useEffect } from 'react';
import { FolderOpen, Cloud, HardDrive } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [defaultPath, setDefaultPath] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.electronAPI.getDefaultSettingsFolder().then(setDefaultPath);
  }, []);

  async function handleSelectFolder() {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setSelectedPath(folder);
    }
  }

  function handleUseDefault() {
    setSelectedPath(defaultPath);
  }

  async function handleConfirm() {
    if (!selectedPath) return;

    setSaving(true);
    try {
      await window.electronAPI.setSettingsLocation(selectedPath);
      onComplete();
    } catch (error) {
      console.error('Failed to set settings location:', error);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-[#3d3d3d]">
          <h1 className="text-lg font-medium text-white">Welcome to Home</h1>
          <p className="text-sm text-[#999] mt-1">
            Let's set up where to store your settings
          </p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#ccc]">
            Choose where to save your settings file. To sync settings across devices,
            select a cloud-synced folder like iCloud Drive or Dropbox.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleUseDefault}
              className={`w-full flex items-center gap-3 p-3 rounded border transition-colors ${
                selectedPath === defaultPath
                  ? 'border-[#0058d0] bg-[#0058d0]/10'
                  : 'border-[#3d3d3d] hover:border-[#555] bg-[#2d2d2d]'
              }`}
            >
              <HardDrive className="w-5 h-5 text-[#999]" />
              <div className="flex-1 text-left">
                <div className="text-sm text-white">Use default location</div>
                <div className="text-xs text-[#666] truncate">{defaultPath}</div>
              </div>
            </button>

            <button
              onClick={handleSelectFolder}
              className={`w-full flex items-center gap-3 p-3 rounded border transition-colors ${
                selectedPath && selectedPath !== defaultPath
                  ? 'border-[#0058d0] bg-[#0058d0]/10'
                  : 'border-[#3d3d3d] hover:border-[#555] bg-[#2d2d2d]'
              }`}
            >
              <Cloud className="w-5 h-5 text-[#999]" />
              <div className="flex-1 text-left">
                <div className="text-sm text-white">Choose sync folder...</div>
                <div className="text-xs text-[#666]">
                  {selectedPath && selectedPath !== defaultPath
                    ? selectedPath
                    : 'iCloud Drive, Dropbox, Google Drive, etc.'}
                </div>
              </div>
              <FolderOpen className="w-4 h-4 text-[#666]" />
            </button>
          </div>

          {selectedPath && (
            <div className="p-3 bg-[#2d2d2d] rounded border border-[#3d3d3d]">
              <div className="text-xs text-[#666] mb-1">Settings will be saved to:</div>
              <div className="text-sm text-white font-mono truncate">
                {selectedPath}/settings.json
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-[#3d3d3d]">
          <button
            onClick={handleConfirm}
            disabled={!selectedPath || saving}
            className="px-4 py-2 bg-[#0058d0] hover:bg-[#0066f5] disabled:bg-[#3d3d3d] disabled:text-[#666] text-white text-sm rounded transition-colors"
          >
            {saving ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
