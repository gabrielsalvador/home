import { useState, useRef, useEffect } from 'react';
import { X, Plus, Folder } from 'lucide-react';
import clsx from 'clsx';
import { TabDefinition } from '../types';

interface TabBarProps {
  tabs: TabDefinition[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename: (tabId: string, name: string) => void;
  onNewTab: () => void;
}

interface TabItemProps {
  tab: TabDefinition;
  isActive: boolean;
  isAllProjects: boolean;
  onSelect: () => void;
  onClose: () => void;
  onRename: (name: string) => void;
}

function TabItem({ tab, isActive, isAllProjects, onSelect, onClose, onRename }: TabItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tab.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleDoubleClick() {
    if (!isAllProjects) {
      setEditName(tab.name);
      setIsEditing(true);
    }
  }

  function handleBlur() {
    if (editName.trim() && editName !== tab.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditName(tab.name);
      setIsEditing(false);
    }
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={clsx(
        'group flex items-center gap-2 h-full px-3 cursor-pointer transition-colors min-w-[100px] max-w-[180px]',
        isActive
          ? 'bg-[#515151] text-white'
          : 'bg-[#3d3d3d] text-[#999] hover:bg-[#454545] hover:text-white'
      )}
    >
      <Folder className="w-3.5 h-3.5 flex-shrink-0 text-[#6bb8ff]" />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-[#1e1e1e] border border-[#0058d0] rounded px-1 py-0.5 text-xs text-white outline-none"
        />
      ) : (
        <span className="text-xs truncate flex-1">{tab.name}</span>
      )}

      {!isAllProjects && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={clsx(
            'p-0.5 rounded hover:bg-[#666] transition-colors',
            isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
          )}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabRename,
  onNewTab,
}: TabBarProps) {
  return (
    <div className="tab-bar flex items-center h-9 bg-[#3d3d3d] border-b border-[#2a2a2a] pl-[72px] select-none app-drag">
      <div className="flex items-center h-full gap-px app-no-drag">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            isAllProjects={tab.id === 'all'}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
            onRename={(name) => onTabRename(tab.id, name)}
          />
        ))}
        <button
          onClick={onNewTab}
          className="flex items-center justify-center w-7 h-full text-[#999] hover:text-white hover:bg-[#454545] transition-colors"
          title="New Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
