import React, { useState, useCallback } from 'react';
import { BuilderNode } from '../utils/nodeFactory';
import { useBuilderStore } from '../store/builderStore';
import { CONTAINER_TYPES } from '../DynamicPages';

interface NavigatorProps {
  tree: BuilderNode;
  onClose?: () => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ tree, onClose }) => {
  const { selectedId, select: setSelectedId, deleteNode, moveNode } = useBuilderStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(nodeId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && sourceId !== targetId) {
      // Check if we're not dropping a parent into its child
      const sourceNode = findNodeInTree(tree, sourceId);
      if (sourceNode && CONTAINER_TYPES.includes(sourceNode.type)) {
        // Check if target is a descendant of source
        if (isDescendantOf(tree, targetId, sourceId)) {
          return; // Prevent dropping parent into child
        }
      }
      moveNode(sourceId, targetId);
    }
  };

  // Helper to find node in tree
  const findNodeInTree = (node: BuilderNode, id: string): BuilderNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeInTree(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to check if target is descendant of source
  const isDescendantOf = (tree: BuilderNode, descendantId: string, ancestorId: string): boolean => {
    const ancestor = findNodeInTree(tree, ancestorId);
    if (!ancestor) return false;
    
    const checkDescendant = (node: BuilderNode): boolean => {
      if (node.id === descendantId) return true;
      if (node.children) {
        return node.children.some(child => checkDescendant(child));
      }
      return false;
    };
    
    return checkDescendant(ancestor);
  };
  
  const renderNode = useCallback((node: BuilderNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const isDragOver = dragOverId === node.id;
    
    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
          } ${isDragOver ? 'bg-blue-50 border-t-2 border-blue-400' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setSelectedId(node.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          {/* Expand/Collapse toggle */}
          <span
            className={`w-4 h-4 flex items-center justify-center text-xs ${
              hasChildren ? 'visible cursor-pointer' : 'invisible'
            }`}
            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
          
          {/* Node icon/type */}
          <span className="text-xs font-medium truncate flex-1">{node.type}</span>
          
          {/* Delete button */}
          {node.id !== 'root' && (
            <span
              className="text-red-500 hover:text-red-700 text-xs cursor-pointer ml-auto px-1"
              onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
              title="Delete element"
            >
              ×
            </span>
          )}
        </div>
        
        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedIds, selectedId, setSelectedId, deleteNode, dragOverId]);
  
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <span className="text-xs font-semibold tracking-wide text-gray-600">LAYERS</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-xs text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
            title="Close Layers Panel"
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-1">
        {tree && renderNode(tree)}
      </div>
    </div>
  );
};
