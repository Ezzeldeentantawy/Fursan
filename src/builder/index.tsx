/**
 * Fursan CMS - Page Builder
 * 
 * A professional drag-and-drop page builder similar to Elementor.
 * Built with React, @dnd-kit, Zustand, and TipTap.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useBuilderStore } from './store/builderStore';
import { WidgetPanel } from './components/WidgetPanel';
import { CanvasInner } from './components/Canvas';
import { PropsPanel } from './components/PropsPanel';
import { Toolbar } from './components/Toolbar';
import pagesApi from '../api/pagesApi';
import { createNode, isContainer } from './utils/nodeFactory';
import { CONTAINER_TYPES } from './DynamicPages';
import type { BuilderNode } from './utils/nodeFactory';

export const Builder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const setTree = useBuilderStore((state) => state.setTree);
  const tree = useBuilderStore((state) => state.tree);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const resetTree = useBuilderStore((state) => state.resetTree);
  
  const [pageTitle, setPageTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Drag state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Load page data on mount
  useEffect(() => {
    const loadPage = async () => {
      if (!id || id === 'new') {
        resetTree();
        setPageTitle('');
        return;
      }

      setIsLoading(true);
      try {
        const response = await pagesApi.getOne(id);
        const pageData = response.data?.data || response.data;
        
        if (pageData) {
          setPageTitle(pageData.title || '');
          
          // Try to load from content.elements (new format)
          if (pageData.content && pageData.content.elements) {
            const elements = pageData.content.elements;
            if (Array.isArray(elements) && elements.length > 0) {
              const rootTree: BuilderNode = {
                id: 'root',
                type: 'container',
                props: {
                  bgColor: 'transparent', bgImage: '', bgSize: 'cover',
                  width: '', height: '', minWidth: '', minHeight: '',
                  maxWidth: '', maxHeight: '', borderRadius: '',
                  borderWidth: '0px', borderColor: '#e2e8f0', borderStyle: 'none',
                  padding: '16px', direction: 'column', align: 'stretch',
                  justify: 'flex-start', gap: '16px',
                },
                children: elements,
              };
              setTree(rootTree);
              return;
            }
          }
          
          // Fallback: try blocks_en (old format)
          if (pageData.blocks_en) {
            try {
              const parsedTree = typeof pageData.blocks_en === 'string' 
                ? JSON.parse(pageData.blocks_en) 
                : pageData.blocks_en;
              
              if (Array.isArray(parsedTree)) {
                const rootTree: BuilderNode = {
                  id: 'root', type: 'container',
                  props: { bgColor: 'transparent', padding: '16px', direction: 'column', align: 'stretch', justify: 'flex-start', gap: '16px' },
                  children: parsedTree,
                };
                setTree(rootTree);
              } else {
                if (parsedTree.type === 'section') parsedTree.type = 'container';
                setTree(parsedTree);
              }
              return;
            } catch (e) {
              console.error('Failed to parse blocks_en:', e);
            }
          }
          
          resetTree();
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        alert('Failed to load page. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [id, setTree, resetTree]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    const fromPanel = active.data.current?.fromPanel;
    if (fromPanel) {
      setActiveDragType(active.data.current?.type);
    } else {
      setActiveDragType(null);
    }
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);
    }
  };

  const findNearestContainer = (targetId: string, node: BuilderNode): string | null => {
    const actualId = targetId.startsWith('droppable-') ? targetId.replace('droppable-', '') : targetId;
    
    if (node.id === actualId && CONTAINER_TYPES.includes(node.type)) {
      return node.id;
    }

    if (node.children) {
      for (const child of node.children) {
        if (child.id === actualId && CONTAINER_TYPES.includes(child.type)) {
          return child.id;
        }
        const found = findNearestContainer(targetId, child);
        if (found) return found;
      }
    }

    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const fromPanel = active.data.current?.fromPanel;

    if (fromPanel) {
      const elementType = active.data.current?.type;
      if (!elementType) return;

      const newNode = createNode(elementType);
      const targetId = findNearestContainer(over.id as string, tree);
      
      if (targetId) {
        addNode(targetId, newNode);
      } else {
        // Fallback: add to root if it's a container
        if (CONTAINER_TYPES.includes(tree.type)) {
          addNode(tree.id, newNode);
        }
      }
    } else {
      // Reorder existing node
      if (activeId !== over.id) {
        moveNode(activeId, over.id as string);
      }
    }
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!id || id === 'new') {
      alert('Please create the page first before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const elements = tree.children || [];
      const contentData = { elements };
      
      await pagesApi.update(id, {
        content: JSON.stringify(contentData),
      });
      
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('Failed to save page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [id, tree]);

  const renderDragOverlay = () => {
    if (!activeDragId) return null;
    if (activeDragType) {
      return (
        <div className="bg-white border-2 border-blue-400 rounded-md p-3 shadow-lg opacity-90">
          Adding: {activeDragType}
        </div>
      );
    }
    return (
      <div className="bg-white border-2 border-blue-400 rounded-md p-3 shadow-lg opacity-90">
        Moving element
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-100">
        <Toolbar
          pageTitle={pageTitle}
          onSave={handleSave}
          isSaving={isSaving}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <WidgetPanel />
          
          <div className="flex-1 overflow-auto bg-gray-200">
            <CanvasInner />
          </div>
          
          <PropsPanel />
        </div>
      </div>

      <DragOverlay>
        {renderDragOverlay()}
      </DragOverlay>
    </DndContext>
  );
};

export default Builder;

export { useBuilderStore } from './store/builderStore';
export type { BuilderNode } from './utils/nodeFactory';
