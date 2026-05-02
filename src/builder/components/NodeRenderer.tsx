import React from 'react';
import { useBuilderStore } from '../store/builderStore';
import { DroppableNode } from './DroppableNode';
import { BuilderNode } from '../utils/nodeFactory';
import { CONTAINER_TYPES } from '../DynamicPages';
import { Breakpoint } from '../DynamicPages';

interface NodeRendererProps {
  node: BuilderNode;
  activeBreakpoint?: Breakpoint;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ node, activeBreakpoint = 'md' }) => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  
  const isSelected = selectedId === node.id;
  const isContainer = CONTAINER_TYPES.includes(node.type);

  // Recursively render children
  const renderChildren = () => {
    if (!isContainer || !node.children || node.children.length === 0) {
      return null;
    }

    return node.children.map((child) => (
      <NodeRenderer key={child.id} node={child} activeBreakpoint={activeBreakpoint} />
    ));
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
