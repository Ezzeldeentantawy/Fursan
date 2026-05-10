import { create } from 'zustand';
import { temporal } from 'zundo';
import type { BuilderNode } from '../utils/nodeFactory';
import * as treeUtils from '../utils/treeUtils';

export type Breakpoint = 'md' | 'sm' | 'base';

interface BuilderState {
  tree: BuilderNode;
  selectedId: string | null;
  isPreviewMode: boolean;
  activeDragId: string | null;
  activeDragType: string | null;
  overContainerId: string | null;
  activeBp: Breakpoint;
  customCss: string | null;
  customJs: string | null;

  siteMenus: Array<{ name: string; links: Array<any> }>;

  // Actions
  select: (id: string | null) => void;
  setSiteMenus: (menus: Array<{ name: string; links: Array<any> }>) => void;
  selectElement: (id: string | null) => void;
  addNode: (parentId: string, node: BuilderNode, index?: number) => void;
  moveNode: (activeId: string, overId: string) => void;
  moveNodeInto: (activeId: string, newParentId: string, index?: number) => void;
  updateProps: (id: string, props: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  setTree: (tree: BuilderNode) => void;
  setPreviewMode: (mode: boolean) => void;
  resetTree: () => void;
  setActiveDragId: (id: string | null) => void;
  setActiveDragType: (type: string | null) => void;
  setOverContainerId: (id: string | null) => void;
  setActiveBp: (bp: Breakpoint) => void;
  setCustomCss: (css: string | null) => void;
  setCustomJs: (js: string | null) => void;
  // New: Track if we should auto-focus the design tab for newly added elements
  pendingDesignTabFocus: boolean;
  setPendingDesignTabFocus: (value: boolean) => void;
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
      customCss: null,
      customJs: null,
      pendingDesignTabFocus: false,
      siteMenus: [],
       activeDragId: null,
       activeDragType: null,
       overContainerId: null,
       activeBp: 'md',

        select: (id) => set({ selectedId: id }),
       selectElement: (id) => set({ selectedId: id }),
       setActiveDragId: (id) => set({ activeDragId: id }),
       setActiveDragType: (type) => set({ activeDragType: type }),
       setOverContainerId: (id) => set({ overContainerId: id }),
       setActiveBp: (bp) => set({ activeBp: bp }),
       setCustomCss: (css) => set({ customCss: css }),
       setCustomJs: (js) => set({ customJs: js }),
       setPendingDesignTabFocus: (value) => set({ pendingDesignTabFocus: value }),
       setSiteMenus: (menus) => set({ siteMenus: menus }),
       
       addNode: (parentId, node, index) => {
         console.log('[BuilderStore] addNode called with parentId:', parentId, 'node:', node, 'index:', index);
         
         return set((state) => {
           // Check if node with this ID already exists in the tree
           const nodeExists = (tree: BuilderNode, id: string): boolean => {
             if (tree.id === id) return true;
             if (tree.children) {
               return tree.children.some(child => nodeExists(child, id));
             }
             return false;
           };
           
           if (nodeExists(state.tree, node.id)) {
             console.warn('[BuilderStore] Node with ID already exists, generating new ID:', node.id);
             node.id = crypto.randomUUID();
           }
           
           const newTree = treeUtils.insertNode(state.tree, parentId, node, index);
           
           return {
             tree: newTree,
             selectedId: node.id,
             pendingDesignTabFocus: true, // Auto-focus design tab for new elements
           };
         });
       },
      
      moveNode: (activeId, overId) => set((state) => ({
        tree: treeUtils.reorderNode(state.tree, activeId, overId),
      })),
      
      moveNodeInto: (activeId, newParentId, index?) => set((state) => ({
        tree: treeUtils.moveNodeIntoParent(state.tree, activeId, newParentId, index),
      })),
      
      updateProps: (id, props) => {
        console.log('[BuilderStore] updateProps called with id:', id);
        console.log('[BuilderStore] props to merge:', props);
        console.log('[BuilderStore] props.responsive:', props.responsive);
        return set((state) => {
          const newTree = treeUtils.updateNodeProps(state.tree, id, props);
          console.log('[BuilderStore] After update, node props:', treeUtils.findNode(newTree, id)?.props);
          return { tree: newTree };
        });
      },
      
      deleteNode: (id) => set((state) => ({
        tree: treeUtils.removeNode(state.tree, id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      })),
      
      duplicateNode: (id) => set((state) => ({
        tree: treeUtils.duplicateNode(state.tree, id),
      })),
      
        setTree: (tree) => {
        // ✅ DEBUG: Check zIndex before deep clone
        const scanForZIndex = (nodes: any[], path: string = '') => {
          nodes.forEach((n: any, i: number) => {
            const cp = path ? `${path} > [${i}]` : `[${i}]`;
            if (n.props?.zIndex !== undefined && n.props?.zIndex !== null && n.props?.zIndex !== 0) {
              console.log(`[STORE TRACE] Before clone ${cp}: ${n.type} zIndex=${n.props.zIndex}`);
            }
            if (n.children) scanForZIndex(n.children, cp);
          });
        };
        if (tree.children) scanForZIndex(tree.children);
        
        // Deep clone
        const cloned = JSON.parse(JSON.stringify(tree));
        
        // ✅ DEBUG: Check zIndex after deep clone
        if (cloned.children) scanForZIndex(cloned.children);
        
        // Deduplicate tree before setting
        const deduplicateTree = (node: BuilderNode): BuilderNode => {
          if (node.children && node.children.length > 0) {
            const seenIds = new Set<string>();
            const uniqueChildren = node.children.filter(child => {
              if (!child.id || seenIds.has(child.id)) {
                console.warn('[BuilderStore] Removing duplicate node:', child.id);
                return false;
              }
              seenIds.add(child.id);
              return true;
            });
            node.children = uniqueChildren.map(child => deduplicateTree(child));
          }
          return node;
        };
        
        const dedupedTree = deduplicateTree(JSON.parse(JSON.stringify(tree)));
        
        // ✅ DEBUG: Check zIndex after dedupe
        if (dedupedTree.children) {
          const scanAfter = (nodes: any[], path: string = '') => {
            nodes.forEach((n: any, i: number) => {
              const cp = path ? `${path} > [${i}]` : `[${i}]`;
              if (n.props?.zIndex !== undefined && n.props?.zIndex !== null && n.props?.zIndex !== 0) {
                console.log(`[STORE TRACE] After dedupe ${cp}: ${n.type} zIndex=${n.props.zIndex}`);
              }
              if (n.children) scanAfter(n.children, cp);
            });
          };
          scanAfter(dedupedTree.children);
        }
        
        set({ tree: dedupedTree });
      },
      setPreviewMode: (mode) => set({ isPreviewMode: mode }),
       resetTree: () => set({ 
          tree: JSON.parse(JSON.stringify(defaultTree)),
          selectedId: null,
          customCss: null,
          customJs: null,
          siteMenus: [],
        }),
    }),
    {
      // Exclude selectedId and isPreviewMode from temporal state
      partialize: (state) => ({ tree: state.tree }),
    }
  )
);
