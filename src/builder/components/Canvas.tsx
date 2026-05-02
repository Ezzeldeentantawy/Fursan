import React from 'react';
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

  console.log('[Canvas] Rendering tree with', tree.children?.length || 0, 'children:', tree.children?.map(c => ({type: c.type, id: c.id?.substring(0, 20)})));
  console.log('[Canvas] Full tree structure:', JSON.stringify(tree, null, 2).substring(0, 500) + '...');
  
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
      className="min-h-full p-8"
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
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-lg">Drag widgets from the panel to start building</p>
            <p className="text-sm mt-2">Your page is empty</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Keep Canvas as alias for backward compatibility
export const Canvas = CanvasInner;
