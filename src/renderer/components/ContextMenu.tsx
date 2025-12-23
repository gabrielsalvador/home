import { useEffect, useRef } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface MenuItem {
  label: string;
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

interface SubmenuProps {
  items: MenuItem[];
  parentRef: React.RefObject<HTMLDivElement>;
}

function Submenu({ items, parentRef }: SubmenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={menuRef}
      className="absolute left-full top-0 ml-0 bg-[#2d2d2d] border border-[#3d3d3d] rounded-md shadow-xl py-1 min-w-[160px] z-50"
    >
      {items.map((item, index) =>
        item.separator ? (
          <div key={index} className="h-px bg-[#3d3d3d] my-1" />
        ) : (
          <button
            key={index}
            onClick={() => item.onClick?.()}
            disabled={item.disabled}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
              item.disabled
                ? 'text-[#666] cursor-not-allowed'
                : 'text-[#e5e5e5] hover:bg-[#0058d0] hover:text-white'
            )}
          >
            <span className="w-4 flex-shrink-0">
              {item.checked && <Check className="w-3 h-3" />}
            </span>
            <span className="flex-1">{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}

function MenuItemComponent({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const itemRef = useRef<HTMLDivElement>(null);

  if (item.separator) {
    return <div className="h-px bg-[#3d3d3d] my-1" />;
  }

  const hasSubmenu = item.submenu && item.submenu.length > 0;

  return (
    <div ref={itemRef} className="relative group">
      <button
        onClick={() => {
          if (!hasSubmenu) {
            item.onClick?.();
            onClose();
          }
        }}
        disabled={item.disabled}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
          item.disabled
            ? 'text-[#666] cursor-not-allowed'
            : 'text-[#e5e5e5] hover:bg-[#0058d0] hover:text-white'
        )}
      >
        <span className="w-4 flex-shrink-0">
          {item.checked && <Check className="w-3 h-3" />}
        </span>
        <span className="flex-1">{item.label}</span>
        {hasSubmenu && <ChevronRight className="w-3 h-3" />}
      </button>

      {hasSubmenu && (
        <div className="hidden group-hover:block">
          <Submenu items={item.submenu!} parentRef={itemRef} />
        </div>
      )}
    </div>
  );
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#2d2d2d] border border-[#3d3d3d] rounded-md shadow-xl py-1 min-w-[180px] z-50"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, index) => (
        <MenuItemComponent key={index} item={item} onClose={onClose} />
      ))}
    </div>
  );
}
