import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { getElementDefinition } from '../registry/componentRegistry';
import { findNode } from '../utils/treeUtils';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, nodeId, onClose }) => {
  const selectElement = useBuilderStore((state) => state.selectElement);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);
  const tree = useBuilderStore((state) => state.tree);

  const menuRef = useRef<HTMLDivElement>(null);  
  const node = findNode(tree, nodeId);
  const elementDef = node ? getElementDefinition(node.type) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleStyleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(nodeId);
    onClose();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(nodeId);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this element?')) {
      deleteNode(nodeId);
      selectElement(null);
    }
    onClose();
  };

  // Adjust position to stay within viewport
  const adjustedPosition = (() => {
    const menuWidth = 200;
    const menuHeight = 200; // approximate
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Adjust horizontal position
    if (x + menuWidth > viewportWidth - 10) {
      adjustedX = viewportWidth - menuWidth - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }
    
    // Adjust vertical position
    if (y + menuHeight > viewportHeight - 10) {
      adjustedY = viewportHeight - menuHeight - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }
    
    return { x: adjustedX, y: adjustedY };
  })();

  return (
    <div
      ref={menuRef}
      className="fixed z-[99999] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[200px]"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Element Type Label */}
      {elementDef && (
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800">
          {elementDef.label}
        </div>
      )}
      
      {/* Style Settings */}
      <button
        onClick={handleStyleSettings}
        className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Style Settings
      </button>

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Duplicate Element
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-full px-3 py-2.5 text-left text-xs font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Element
      </button>

      {/* Drag (if needed) */}
      <div className="border-t border-slate-800 mt-1 pt-1">
        <div
          className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2 cursor-move"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Drag Element
        </div>
      </div>
    </div>
  );
};
