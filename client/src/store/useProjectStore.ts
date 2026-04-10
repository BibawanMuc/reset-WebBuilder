import { create } from 'zustand';
import type { Project, ProjectOverview } from '../types';

interface ProjectState {
  projects: ProjectOverview[];
  activeProject: Project | null;
  isLoading: boolean;
  selectedBlockId: string | null;
  
  setProjects: (projects: ProjectOverview[]) => void;
  setActiveProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedBlockId: (id: string | null) => void;
  updateBlock: (blockId: string, newProps: Record<string, any>) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  selectedBlockId: null,

  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject, selectedBlockId: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
  
  updateBlock: (blockId, newProps) => set((state) => {
    if (!state.activeProject) return state;
    
    // We only support single page right now
    const pages = [...state.activeProject.pages];
    const pageIndex = 0;
    
    const newBlocks = pages[pageIndex].blocks.map(b => 
      b.id === blockId ? { ...b, props: { ...b.props, ...newProps } } : b
    );
    
    pages[pageIndex] = { ...pages[pageIndex], blocks: newBlocks };
    
    return {
      activeProject: {
        ...state.activeProject,
        pages
      }
    };
  }),

  deleteBlock: (blockId) => set((state) => {
    if (!state.activeProject) return state;
    const pages = [...state.activeProject.pages];
    const newBlocks = pages[0].blocks.filter(b => b.id !== blockId);
    pages[0] = { ...pages[0], blocks: newBlocks };
    return {
      activeProject: { ...state.activeProject, pages },
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId
    };
  }),

  duplicateBlock: (blockId) => set((state) => {
    if (!state.activeProject) return state;
    const pages = [...state.activeProject.pages];
    const targetIndex = pages[0].blocks.findIndex(b => b.id === blockId);
    if (targetIndex === -1) return state;
    
    const targetBlock = JSON.parse(JSON.stringify(pages[0].blocks[targetIndex])); // deep copy
    const newBlock = {
      ...targetBlock,
      id: targetBlock.type + '_' + Math.random().toString(36).substring(2, 9),
    };
    
    const newBlocks = [...pages[0].blocks];
    newBlocks.splice(targetIndex + 1, 0, newBlock);
    pages[0] = { ...pages[0], blocks: newBlocks };
    
    return {
      activeProject: { ...state.activeProject, pages },
      selectedBlockId: newBlock.id
    };
  })
}));
