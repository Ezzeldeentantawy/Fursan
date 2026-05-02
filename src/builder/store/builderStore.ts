import { create } from 'zustand';
import { temporal } from 'zundo';
import type { BuilderNode } from '../utils/nodeFactory';
import * as treeUtils from '../utils/treeUtils';

interface BuilderState {
  tree: BuilderNode;
  selectedId: string | null;
  isPreviewMode: boolean;
  
  // Actions
  select: (id: string | null) => void;
  addNode: (parentId: string, node: BuilderNode) => void;
  moveNode: (activeId: string, overId: string) => void;
  updateProps: (id: string, props: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setTree: (tree: BuilderNode) => void;
  setPreviewMode: (mode: boolean) => void;
  resetTree: () => void;
}

const defaultTree: BuilderNode = { 
  id: 'root', 
  type: 'container', 
  props: {
    bgColor: 'transparent',
    bgImage: '',
    bgSize: 'cover',
    width: '',
    height: '',
    minWidth: '',
    minHeight: '',
    maxWidth: '',
    maxHeight: '',
    borderRadius: '',
    borderWidth: '0px',
    borderColor: '#e2e8f0',
    borderStyle: 'none',
    padding: '16px',
    direction: 'column',
    align: 'stretch',
    justify: 'flex-start',
    gap: '16px',
  }, 
  children: [] 
};

export const useBuilderStore = create<BuilderState>()(
  temporal(
    (set, get) => ({
      tree: defaultTree,
      selectedId: null,
      isPreviewMode: false,
      
      select: (id) => set({ selectedId: id }),
      
      addNode: (parentId, node) => set((state) => ({
        tree: treeUtils.insertNode(state.tree, parentId, node),
      })),
      
      moveNode: (activeId, overId) => set((state) => ({
        tree: treeUtils.reorderNode(state.tree, activeId, overId),
      })),
      
      updateProps: (id, props) => set((state) => ({
        tree: treeUtils.updateNodeProps(state.tree, id, props),
      })),
      
      deleteNode: (id) => set((state) => ({
        tree: treeUtils.removeNode(state.tree, id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      })),
      
      duplicateNode: (id) => set((state) => ({
        tree: treeUtils.duplicateNode(state.tree, id),
      })),
      
      setTree: (tree) => set({ tree }),
      setPreviewMode: (mode) => set({ isPreviewMode: mode }),
      resetTree: () => set({ 
        tree: JSON.parse(JSON.stringify(defaultTree)),
        selectedId: null,
      }),
    }),
    {
      // Exclude selectedId and isPreviewMode from temporal state
      partialize: (state) => ({ tree: state.tree }),
    }
  )
);
