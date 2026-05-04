import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderStore } from '../store/builderStore';
import { DroppableNode } from './DroppableNode';
import { BuilderNode } from '../utils/nodeFactory';
import { CONTAINER_TYPES } from '../DynamicPages';
import { Breakpoint } from '../DynamicPages';

/**
 * Droppable target rendered between/inside containers during drag.
 * ID pattern: dropzone-{parentId}-{index}
 * handleDragEnd parses this to know exactly where to insert.
 */
const DropZoneTarget: React.FC<{ parentId: string; index: number }> = ({ parentId, index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone-${parentId}-${index}`,
    data: {
      isContainer: true,
      parentId,
      insertIndex: index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center min-h-[36px] mx-1 my-0.5 rounded-md border-2 border-dashed transition-all duration-150 ${
        isOver
          ? 'border-green-400 bg-green-100/80 scale-[1.02]'
          : 'border-blue-300 bg-blue-50/40'
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        isOver ? 'text-green-600' : 'text-blue-400'
      }`}>
        {isOver ? '✓ Drop' : '+ Insert'}
      </span>
    </div>
  );
};

interface NodeRendererProps {
  node: BuilderNode;
  activeBreakpoint?: Breakpoint;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ node, activeBreakpoint = 'md' }) => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const activeDragId = useBuilderStore((state) => state.activeDragId);
  const activeDragType = useBuilderStore((state) => state.activeDragType);
  const overContainerId = useBuilderStore((state) => state.overContainerId);
  
  const isSelected = selectedId === node.id;
  const isContainer = CONTAINER_TYPES.includes(node.type);
  const isDraggingFromPanel = activeDragId !== null && activeDragType !== null;
  // Only show drop zones for the container currently being hovered
  const showDropZones = isDraggingFromPanel && isContainer && overContainerId === node.id;

  // Recursively render children with drop zones between them
  const renderChildren = () => {
    if (!isContainer) {
      return null;
    }

    const children = node.children || [];

    // Empty container: single drop zone at index 0
    if (children.length === 0) {
      return showDropZones ? <DropZoneTarget parentId={node.id} index={0} /> : null;
    }

    // Container with children: drop zone before each child + after last child
    return (
      <>
        {children.map((child, index) => (
          <React.Fragment key={child.id}>
            {showDropZones && <DropZoneTarget parentId={node.id} index={index} />}
            <NodeRenderer node={child} activeBreakpoint={activeBreakpoint} />
          </React.Fragment>
        ))}
        {showDropZones && <DropZoneTarget parentId={node.id} index={children.length} />}
      </>
    );
  };

  return (
    <DroppableNode
      node={node}
      isSelected={isSelected}
      isPreviewMode={isPreviewMode}
      activeBreakpoint={activeBreakpoint}
    >
      {renderChildren()}
    </DroppableNode>
  );
};
