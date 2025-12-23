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
  small?: boolean;
}

export default function TagBadge({ tag, onRemove, onClick, small }: TagBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full text-white',
        getTagColor(tag),
        onClick && 'cursor-pointer hover:opacity-80',
        small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'
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
