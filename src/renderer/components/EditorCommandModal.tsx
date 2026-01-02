import { useState } from 'react';
import { X } from 'lucide-react';

interface EditorCommandModalProps {
  projectName: string;
  currentCommand?: string;
  globalCommand: string;
  onSave: (command: string | undefined) => void;
  onClose: () => void;
}

export default function EditorCommandModal({
  projectName,
  currentCommand,
  globalCommand,
  onSave,
  onClose,
}: EditorCommandModalProps) {
  const [command, setCommand] = useState(currentCommand || '');
  const [useCustom, setUseCustom] = useState(!!currentCommand);

  function handleSave() {
    onSave(useCustom && command.trim() ? command.trim() : undefined);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d3d3d]">
          <h2 className="text-sm font-medium text-white">Editor Command for {projectName}</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#999] hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useCustom}
                onChange={() => setUseCustom(false)}
                className="accent-[#0058d0]"
              />
              <span className="text-sm text-[#e5e5e5]">Use global setting</span>
            </label>
            <p className="text-[11px] text-[#666] ml-5">
              Currently: <code className="bg-[#3d3d3d] px-1 rounded text-[#999]">{globalCommand}</code>
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                className="accent-[#0058d0]"
              />
              <span className="text-sm text-[#e5e5e5]">Use custom command</span>
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => {
                setCommand(e.target.value);
                setUseCustom(true);
              }}
              placeholder="code $folder_path"
              disabled={!useCustom}
              className="w-full px-3 py-1.5 bg-[#1e1e1e] border border-[#555] rounded text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#0058d0] disabled:opacity-50"
            />
            <p className="text-[11px] text-[#666]">
              Use <code className="bg-[#3d3d3d] px-1 rounded text-[#999]">$folder_path</code> as placeholder for the project path
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
