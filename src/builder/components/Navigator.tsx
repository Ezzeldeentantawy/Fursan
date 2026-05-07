import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BuilderNode } from '../utils/nodeFactory';
import { useBuilderStore } from '../store/builderStore';
import { CONTAINER_TYPES, ELEMENTS_BY_TYPE } from '../DynamicPages';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface NavigatorProps {
  tree: BuilderNode;
  onClose?: () => void;
}

export const Navigator: React.FC<NavigatorProps> = ({ tree, onClose }) => {
  const { selectedId, select: setSelectedId, deleteNode, moveNode, moveNodeInto, duplicateNode } = useBuilderStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  // Timer ref for auto-expanding collapsed containers when dragging over them
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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

    // Auto-expand collapsed containers when hovering over them during drag
    const node = findNodeInTree(tree, nodeId);
    if (node && CONTAINER_TYPES.includes(node.type) && node.children && node.children.length > 0) {
      if (!expandedIds.has(nodeId)) {
        // Start a timer (if not already running) to auto-expand this container
        if (expandTimerRef.current === null) {
          expandTimerRef.current = setTimeout(() => {
            setExpandedIds(prev => {
              const next = new Set(prev);
              next.add(nodeId);
              return next;
            });
            expandTimerRef.current = null;
          }, 500);
        }
      } else {
        // Already expanded — clear any stale timer
        if (expandTimerRef.current) {
          clearTimeout(expandTimerRef.current);
          expandTimerRef.current = null;
        }
      }
    } else {
      // Not hovering over a collapsible container — clear timer
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    // Clear auto-expand timer
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId && sourceId !== targetId) {
      const sourceNode = findNodeInTree(tree, sourceId);
      const targetNode = findNodeInTree(tree, targetId);
      
      // Prevent dropping a parent into its own descendant
      if (sourceNode && CONTAINER_TYPES.includes(sourceNode.type)) {
        if (isDescendantOf(tree, targetId, sourceId)) {
          return;
        }
      }
      
      // If target is a container, drop the source INSIDE it (as a child)
      if (targetNode && CONTAINER_TYPES.includes(targetNode.type)) {
        moveNodeInto(sourceId, targetId);
      } else {
        // Otherwise use existing reorder-as-sibling behavior
        moveNode(sourceId, targetId);
      }
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
  
  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault(); // Prevent browser context menu
    if (nodeId === 'root') return; // Don't show for root
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
  };

  // Close context menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const renderNode = useCallback((node: BuilderNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const isDragOver = dragOverId === node.id;

    // Get element definition for icon and label
    const elementDef = ELEMENTS_BY_TYPE[node.type];
    const IconComponent = elementDef?.icon;
    const displayLabel = elementDef?.label || node.type;
    
    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-slate-800 transition-colors ${
            isSelected ? 'bg-slate-700 border-l-2 border-blue-500' : ''
          } ${isDragOver ? 'bg-slate-700 border-t-2 border-blue-400' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setSelectedId(node.id)}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          {/* Expand/Collapse toggle */}
          <span
            className={`w-4 h-4 flex items-center justify-center ${
              hasChildren ? 'visible cursor-pointer' : 'invisible'
            }`}
            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
          >
            {isExpanded ? <ChevronDown size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
          </span>

          {/* Node icon and label */}
          <span className="flex items-center gap-1 text-sm truncate flex-1 text-slate-300">
            {IconComponent && <IconComponent size={14} />}
            <span className="font-bold">{displayLabel}</span>
          </span>
        </div>
        
        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedIds, selectedId, setSelectedId, deleteNode, duplicateNode, moveNodeInto, dragOverId]);
   
  return (
    <div className="h-full overflow-y-auto bg-slate-900">
      <div className="p-1">
        {tree && renderNode(tree)}
      </div>
      
      {contextMenu && (
        <>
          {/* Overlay to catch outside clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          {/* Context Menu */}
          <div 
            className="fixed z-50 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div
              className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300"
              onClick={() => {
                duplicateNode(contextMenu.nodeId);
                setContextMenu(null);
              }}
            >
              Duplicate
            </div>
            <div
              className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-sm text-red-400"
              onClick={() => {
                deleteNode(contextMenu.nodeId);
                setContextMenu(null);
              }}
            >
              Delete
            </div>
          </div>
        </>
      )}
    </div>
  );
};
