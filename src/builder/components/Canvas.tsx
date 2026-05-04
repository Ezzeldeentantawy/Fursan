import React, { useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderStore } from '../store/builderStore';
import { NodeRenderer } from './NodeRenderer';
import { CONTAINER_TYPES } from '../DynamicPages';
import { Breakpoint, breakpoints } from '../DynamicPages';

interface CanvasInnerProps {
  activeBreakpoint?: Breakpoint;
}

export const CanvasInner: React.FC<CanvasInnerProps> = ({ activeBreakpoint = 'md' }) => {
  const tree = useBuilderStore((state) => state.tree);
  const select = useBuilderStore((state) => state.select);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const activeDragId = useBuilderStore((state) => state.activeDragId);
  const activeDragType = useBuilderStore((state) => state.activeDragType);
  const isDraggingFromPanel = activeDragId !== null && activeDragType !== null;

  // Make the root container droppable
  const { setNodeRef: setRootDroppableRef, isOver: isRootOver } = useDroppable({
    id: 'root',
    data: {
      type: 'container',
      isContainer: true,
    },
    disabled: isPreviewMode,
  });

  // Add effect to log when isOver changes
  useEffect(() => {
    console.log('[Canvas] Root isOver:', isRootOver);
  }, [isRootOver]);

  const handleCanvasClick = () => {
    if (!isPreviewMode) {
      select(null);
    }
  };

  // Get the max-width for the current breakpoint from breakpoints array
  const getBreakpointMaxWidth = () => {
    const bpConfig = breakpoints.find(bp => bp.key === activeBreakpoint);
    return bpConfig?.width || '100%';
  };
  
  // Check for duplicates in children
  if (tree.children && tree.children.length > 0) {
    const ids = tree.children.map(c => c.id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.warn('[Canvas] DUPLICATES DETECTED in tree.children!', ids);
    }
  }

  return (
    <div
      ref={setRootDroppableRef}
      className={`min-h-full p-8 transition-all ${
        isDraggingFromPanel && isRootOver
          ? 'outline-2 outline-solid outline-green-400 bg-green-50/50'
          : isDraggingFromPanel
            ? 'bg-blue-50/20'
            : ''
      }`}
      onClick={handleCanvasClick}
    >
      {tree.children && tree.children.length > 0 ? (
        <div 
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: activeBreakpoint === 'md' ? '100%' : getBreakpointMaxWidth() }}
        >
          {tree.children.map((child) => (
            <NodeRenderer key={child.id} node={child} activeBreakpoint={activeBreakpoint} />
          ))}
        </div>
      ) : (
        // Empty state - prominent drop zone when dragging from panel
        <div className={`flex items-center justify-center h-[calc(100vh-200px)] transition-all ${
          isDraggingFromPanel ? 'scale-105' : ''
        }`}>
          <div className={`text-center p-8 rounded-lg transition-all ${
            isDraggingFromPanel
              ? 'border-4 border-dashed border-blue-400 bg-blue-50/70 shadow-lg'
              : 'border-2 border-dashed border-slate-300 bg-white'
          }`}>
            <svg className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              isDraggingFromPanel ? 'text-blue-500' : 'text-slate-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
            <p className={`text-lg transition-colors ${
              isDraggingFromPanel ? 'text-blue-600 font-semibold' : 'text-slate-400'
            }`}>
              {isDraggingFromPanel ? 'Drop here to add element' : 'Drag widgets from the panel to start building'}
            </p>
            <p className="text-sm mt-2 text-slate-300">Your page is empty</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Keep Canvas as alias for backward compatibility
export const Canvas = CanvasInner;
