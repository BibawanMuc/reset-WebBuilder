import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { Header } from './Header';
import { useProjectStore } from '../../store/useProjectStore';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';

export const EditorLayout = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  if (!activeProject) return null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    
    if (!over) return;

    // Handle adding new block from sidebar vs sorting existing
    if (active.data.current?.isNewBlock && (over.id === 'canvas-droppable' || over.data.current?.type === 'SortableBlock')) {
      const type = active.data.current.type;
      const newBlock = {
        id: crypto.randomUUID(),
        type,
        props: {}
      };
      
      const newPages = [...activeProject.pages];
      const blocks = [...newPages[0].blocks];
      
      if (over.id === 'canvas-droppable') {
        blocks.push(newBlock);
      } else {
        const overIndex = blocks.findIndex(b => b.id === over.id);
        if (overIndex >= 0) {
          blocks.splice(overIndex + 1, 0, newBlock);
        } else {
          blocks.push(newBlock);
        }
      }
      
      newPages[0].blocks = blocks;
      setActiveProject({ ...activeProject, pages: newPages });
    } else if (active.id !== over.id && active.data.current?.type === 'SortableBlock') {
      const newPages = [...activeProject.pages];
      const blocks = newPages[0].blocks;
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        newPages[0].blocks = arrayMove(blocks, oldIndex, newIndex);
        setActiveProject({ ...activeProject, pages: newPages });
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-200">
            <div className="w-full min-h-full flex justify-center p-8 pb-32">
              <Canvas />
            </div>
          </main>
        </div>
      </div>
      <DragOverlay>
        {activeDragId ? (
          <div className="p-4 bg-white border border-gray-300 rounded shadow-2xl opacity-80">
            Wird verschoben...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
