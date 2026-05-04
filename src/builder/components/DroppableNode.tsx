import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../store/builderStore';
import { ELEMENTS_BY_TYPE, CONTAINER_TYPES } from '../DynamicPages';
import { renderNode } from '../registry/componentRegistry';
import { BuilderNode } from '../utils/nodeFactory';
import { Breakpoint } from '../DynamicPages';
import { ContextMenu } from './ContextMenu';

interface DroppableNodeProps {
  node: BuilderNode;
  isSelected: boolean;
  isPreviewMode: boolean;
  activeBreakpoint?: Breakpoint;
  children?: React.ReactNode;
}

export const DroppableNode: React.FC<DroppableNodeProps> = ({
  node,
  isSelected,
  isPreviewMode,
  activeBreakpoint = 'md',
  children,
}) => {
  const selectElement = useBuilderStore((state) => state.selectElement);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isContainer = CONTAINER_TYPES.includes(node.type);

  // Set up sortable for reordering - keeps drag functionality
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: node.type,
      isContainer,
    },
  });

  // Set up droppable for containers — use node.id directly (not prefixed)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: node.type,
      isContainer: true,
    },
    disabled: !isContainer || isPreviewMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

   // Responsive styles are now applied directly via activeBreakpoint prop in renderNode()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      selectElement(node.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPreviewMode) {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Combine refs
  const setRefs = (el: HTMLElement | null) => {
    setSortableRef(el);
    if (isContainer) {
      setDroppableRef(el);
    }
  };

  // Build DnD props to pass to the element - ONLY DnD styles, NO responsive styles
  const dndProps = {
    ref: setRefs,
    style: style, // Only DnD styles (transform, transition, opacity)
    className: [
      'relative',
      isSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-2' : '',
      isOver && isContainer && !isPreviewMode ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50' : '',
      isDragging ? 'opacity-50' : '',
    ].filter(Boolean).join(' '),
    onClick: handleClick,
    onContextMenu: handleContextMenu,
  };

  // Create drop zone element for containers
  const dropZone = isContainer && !isPreviewMode ? (
    <div
      key="drop-zone"
      className={`min-h-[60px] border-2 border-dashed rounded p-2 mt-1 transition-colors ${
        isOver
          ? 'border-blue-400 bg-blue-50/70'
          : 'border-slate-300 bg-transparent'
      }`}
    >
      {(!children || (Array.isArray(children) && children.length === 0)) && (
        <div className={`text-center text-sm py-6 transition-colors ${
          isOver ? 'text-blue-500 font-medium' : 'text-slate-400'
        }`}>
          {isOver ? 'Drop here' : 'Drop elements here'}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      {/* Render the node directly with DnD props and activeBreakpoint passed in */}
      {renderNode(node, children, dndProps, dropZone, activeBreakpoint)}
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={node.id}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  );
};
