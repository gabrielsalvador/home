import { Folder, Star, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Project, Settings } from '../types';

interface SidebarProps {
  projects: Project[];
  settings: Settings | null;
  selectedProject: string | null;
  filterTag: string | null;
  onProjectSelect: (path: string | null) => void;
  onFilterTagChange: (tag: string | null) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide hover:text-white transition-colors"
      >
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {icon}
        <span>{title}</span>
      </button>
      {isOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, selected, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 w-full px-3 py-1 text-sm transition-colors rounded-md mx-1',
        selected
          ? 'bg-[#0058d0] text-white'
          : 'text-[#e5e5e5] hover:bg-[#3d3d3d]'
      )}
      style={{ width: 'calc(100% - 8px)' }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Sidebar({
  projects,
  settings,
  selectedProject,
  filterTag,
  onProjectSelect,
  onFilterTagChange,
}: SidebarProps) {
  const pinnedProjects = projects.filter(p => settings?.projects[p.path]?.pinned);

  const allTags = new Set<string>();
  if (settings) {
    Object.values(settings.projects).forEach(p => {
      p.tags?.forEach(t => allTags.add(t));
    });
  }
  const tags = Array.from(allTags).sort();

  return (
    <div className="w-[200px] min-w-[200px] bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-2">
        {/* All Projects */}
        <div className="px-1 mb-2">
          <SidebarItem
            icon={<Folder className="w-4 h-4 text-[#6bb8ff]" />}
            label="All Projects"
            selected={!filterTag && !selectedProject}
            onClick={() => {
              onFilterTagChange(null);
              onProjectSelect(null);
            }}
          />
        </div>

        {/* Favorites */}
        {pinnedProjects.length > 0 && (
          <Section title="Favorites" icon={<Star className="w-3 h-3" />}>
            {pinnedProjects.map(project => (
              <SidebarItem
                key={project.path}
                icon={<Folder className="w-4 h-4 text-[#6bb8ff]" />}
                label={project.name}
                selected={selectedProject === project.path}
                onClick={() => onProjectSelect(project.path)}
              />
            ))}
          </Section>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <Section title="Tags" icon={<Tag className="w-3 h-3" />}>
            {tags.map(tag => (
              <SidebarItem
                key={tag}
                icon={<div className="w-3 h-3 rounded-full bg-blue-500" />}
                label={tag}
                selected={filterTag === tag}
                onClick={() => onFilterTagChange(filterTag === tag ? null : tag)}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
