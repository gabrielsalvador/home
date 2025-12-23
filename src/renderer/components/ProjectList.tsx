import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project, Settings, ProjectSettings } from '../types';
import ProjectCard from './ProjectCard';
import { FolderOpen } from 'lucide-react';

interface SortableProjectCardProps {
  project: Project;
  settings?: ProjectSettings;
  onOpenEditor: (path: string) => void;
  onTogglePin: (path: string) => void;
  onPush: (path: string) => Promise<{ success: boolean; message: string }>;
  onCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string }>;
  onUpdateTags: (path: string, tags: string[]) => void;
}

function SortableProjectCard(props: SortableProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.project.path,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ProjectCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

interface ProjectListProps {
  projects: Project[];
  settings: Settings | null;
  onOpenEditor: (path: string) => void;
  onTogglePin: (path: string) => void;
  onPush: (path: string) => Promise<{ success: boolean; message: string }>;
  onCreateRemote: (path: string, name: string, isPrivate: boolean) => Promise<{ success: boolean; message: string }>;
  onUpdateTags: (path: string, tags: string[]) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export default function ProjectList({
  projects,
  settings,
  onOpenEditor,
  onTogglePin,
  onPush,
  onCreateRemote,
  onUpdateTags,
  onReorder,
}: ProjectListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.path === active.id);
      const newIndex = projects.findIndex((p) => p.path === over.id);
      onReorder(oldIndex, newIndex);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FolderOpen className="w-12 h-12 mb-4" />
        <p className="text-lg mb-2">No projects found</p>
        <p className="text-sm">Configure your code folder in settings or create a new project.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects.map((p) => p.path)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {projects.map((project) => (
              <SortableProjectCard
                key={project.path}
                project={project}
                settings={settings?.projects[project.path]}
                onOpenEditor={onOpenEditor}
                onTogglePin={onTogglePin}
                onPush={onPush}
                onCreateRemote={onCreateRemote}
                onUpdateTags={onUpdateTags}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
