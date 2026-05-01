/**
 * Shared Helpers for Page Builder
 * Drag-and-drop utilities using @dnd-kit
 */

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { createBlock } from '../Pages/Builder/blockTypes';

// Default sensors configuration for drag-and-drop
export const createSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};

// Handle drag end for reordering blocks
export const handleDragEnd = (event, items, setItems, onReorder) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    
    // Update order property
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setItems(reorderedItems);
    
    if (onReorder) {
      onReorder(reorderedItems);
    }
  }
};

// Handle drag start
export const handleDragStart = (event, setActiveId) => {
  setActiveId(event.active.id);
};

// Handle drag cancel
export const handleDragCancel = (setActiveId) => {
  setActiveId(null);
};

// DnD Context wrapper component
export const DndContextWrapper = ({
  children,
  items,
  onReorder,
  renderOverlay,
}) => {
  const [activeId, setActiveId] = React.useState(null);
  const sensors = createSensors();

  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  const handleDragEndEvent = (event) => {
    handleDragEnd(event, items, onReorder || (() => {}), onReorder);
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => handleDragStart(event, setActiveId)}
      onDragEnd={handleDragEndEvent}
      onDragCancel={() => handleDragCancel(setActiveId)}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
      <DragOverlay>
        {activeId && activeItem && renderOverlay
          ? renderOverlay(activeItem)
          : null}
      </DragOverlay>
    </DndContext>
  );
};

// Block manipulation helpers
export const blockHelpers = {
  // Add a new block to the list
  addBlock: (blocks, blockType, insertIndex = -1) => {
    const newBlock = createBlock(blockType);
    if (!newBlock) return blocks;

    const newBlocks = [...blocks];
    if (insertIndex >= 0 && insertIndex < newBlocks.length) {
      newBlocks.splice(insertIndex, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    // Reorder
    return newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));
  },

  // Remove a block by ID
  removeBlock: (blocks, blockId) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    return newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));
  },

  // Update block content
  updateBlock: (blocks, blockId, content) => {
    return blocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          content: { ...block.content, ...content },
        };
      }
      return block;
    });
  },

  // Duplicate a block
  duplicateBlock: (blocks, blockId) => {
    const sourceBlock = blocks.find((block) => block.id === blockId);
    if (!sourceBlock) return blocks;

    const newBlock = {
      ...JSON.parse(JSON.stringify(sourceBlock)),
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const sourceIndex = blocks.findIndex((block) => block.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(sourceIndex + 1, 0, newBlock);

    return newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));
  },

  // Move block up
  moveBlockUp: (blocks, blockId) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index <= 0) return blocks;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;

    return newBlocks.map((block, idx) => ({
      ...block,
      order: idx,
    }));
  },

  // Move block down
  moveBlockDown: (blocks, blockId) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index === -1 || index >= blocks.length - 1) return blocks;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;

    return newBlocks.map((block, idx) => ({
      ...block,
      order: idx,
    }));
  },
};

// SortableItem wrapper component
export const SortableItemWrapper = ({ children, id }) => {
  return (
    <SortableItem id={id}>
      {children}
    </SortableItem>
  );
};

export default {
  DndContextWrapper,
  blockHelpers,
  createSensors,
  handleDragEnd,
  handleDragStart,
  SortableItemWrapper,
};
