import { X } from 'lucide-react';
import clsx from 'clsx';

const TAG_COLORS: Record<string, string> = {
  work: 'bg-blue-600',
  personal: 'bg-green-600',
  active: 'bg-purple-600',
  archived: 'bg-gray-600',
  urgent: 'bg-red-600',
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag.toLowerCase()] || 'bg-slate-600';
}

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
}

export default function TagBadge({ tag, onRemove, onClick }: TagBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white',
        getTagColor(tag),
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      onClick={onClick}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-white/20 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
