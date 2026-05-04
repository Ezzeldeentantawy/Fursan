import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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
  const activeDragId = useBuilderStore((state) => state.activeDragId);
  const activeDragType = useBuilderStore((state) => state.activeDragType);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isContainer = CONTAINER_TYPES.includes(node.type);
  const isDraggingFromPanel = activeDragId !== null && activeDragType !== null;

  // Set up draggable for ALL elements (for reordering)
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: {
      type: node.type,
      isContainer,
      fromPanel: false,
    },
    disabled: isPreviewMode,
  });

  // Set up droppable for containers (to accept new elements from WidgetPanel)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: node.type,
      isContainer,
    },
    disabled: !isContainer || isPreviewMode,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  // Combine refs - use draggable ref for all elements, droppable ref only for containers
  const setRefs = (el: HTMLElement | null) => {
    setDraggableRef(el);
    if (isContainer) {
      setDroppableRef(el);
    }
    // Set id directly on DOM element
    if (el) {
      el.id = node.id;
      el.setAttribute('data-node-id', node.id);
    }
  };

  // Build DnD props to pass to the element
  // FIX Issue 1: Hide original element when dragging (opacity: 0) to prevent empty spaces
  const dndProps = {
    ref: setRefs,
    id: node.id,
    'data-node-id': node.id,
    style: {
      // Hide original element when dragging - prevents empty spaces
      // The DragOverlay handles the visual preview at cursor position
      opacity: isDragging ? 0 : 1,
      // No transform or transition - let DragOverlay handle preview
    },
    className: [
      isSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-2' : '',
      // Hovered container gets a subtle green background
      isOver && isContainer ? 'bg-green-50/50' : '',
    ].filter(Boolean).join(' '),
    onClick: handleClick,
    onContextMenu: handleContextMenu,
    ...attributes,
    ...listeners,
  };

  return (
    <>
      {renderNode(node, children, dndProps, activeBreakpoint)}
      
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
