import { GitBranch, Cloud, CloudOff, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import clsx from 'clsx';
import { ProjectStatus } from '../types';

interface StatusIndicatorProps {
  status: ProjectStatus;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  if (!status.isGitRepo) {
    return (
      <div className="flex items-center gap-1.5 text-slate-500" title="No git repository">
        <GitBranch className="w-4 h-4" />
        <span className="text-xs">No repo</span>
      </div>
    );
  }

  if (!status.hasRemote) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-500" title="No remote configured">
        <CloudOff className="w-4 h-4" />
        <span className="text-xs">No remote</span>
      </div>
    );
  }

  if (status.hasChanges) {
    return (
      <div className="flex items-center gap-1.5 text-orange-500" title="Uncommitted changes">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Changes</span>
      </div>
    );
  }

  if (status.ahead > 0) {
    return (
      <div className="flex items-center gap-1.5 text-blue-400" title={`${status.ahead} commit(s) to push`}>
        <Upload className="w-4 h-4" />
        <span className="text-xs">↑{status.ahead}</span>
      </div>
    );
  }

  if (status.behind > 0) {
    return (
      <div className="flex items-center gap-1.5 text-purple-400" title={`${status.behind} commit(s) to pull`}>
        <Cloud className="w-4 h-4" />
        <span className="text-xs">↓{status.behind}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-green-500" title="Up to date">
      <CheckCircle className="w-4 h-4" />
      <span className="text-xs">Synced</span>
    </div>
  );
}
