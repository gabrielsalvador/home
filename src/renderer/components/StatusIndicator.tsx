import { GitBranch, Cloud, CloudOff, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import clsx from 'clsx';
import { ProjectStatus } from '../types';

interface StatusIndicatorProps {
  status: ProjectStatus;
  compact?: boolean;
  selected?: boolean;
}

export default function StatusIndicator({ status, compact, selected }: StatusIndicatorProps) {
  const baseClass = compact ? 'text-xs' : 'text-xs';
  const iconClass = compact ? 'w-3 h-3' : 'w-4 h-4';

  if (!status.isGitRepo) {
    return (
      <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-white/60' : 'text-[#666]')} title="No git repository">
        <GitBranch className={iconClass} />
        {!compact && <span>No repo</span>}
      </div>
    );
  }

  if (!status.hasRemote) {
    return (
      <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-yellow-300' : 'text-yellow-500')} title="No remote configured">
        <CloudOff className={iconClass} />
        {!compact && <span>No remote</span>}
      </div>
    );
  }

  if (status.hasChanges) {
    return (
      <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-orange-300' : 'text-orange-500')} title="Uncommitted changes">
        <AlertCircle className={iconClass} />
        {!compact && <span>Changes</span>}
      </div>
    );
  }

  if (status.ahead > 0) {
    return (
      <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-blue-300' : 'text-blue-400')} title={`${status.ahead} commit(s) to push`}>
        <Upload className={iconClass} />
        <span>↑{status.ahead}</span>
      </div>
    );
  }

  if (status.behind > 0) {
    return (
      <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-purple-300' : 'text-purple-400')} title={`${status.behind} commit(s) to pull`}>
        <Cloud className={iconClass} />
        <span>↓{status.behind}</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center gap-1', baseClass, selected ? 'text-green-300' : 'text-green-500')} title="Up to date">
      <CheckCircle className={iconClass} />
      {!compact && <span>Synced</span>}
    </div>
  );
}
