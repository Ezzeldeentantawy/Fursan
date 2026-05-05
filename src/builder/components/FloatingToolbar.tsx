import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { findNode } from '../utils/treeUtils';
import { CONTAINER_TYPES } from '../DynamicPages';
import { ELEMENTS_BY_TYPE } from '../DynamicPages';

export const FloatingToolbar: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);
  const selectElement = useBuilderStore((state) => state.selectElement);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const node = selectedId ? findNode(tree, selectedId) : null;

  useEffect(() => {
    if (!selectedId || !node || isPreviewMode) {
      return;
    }

    const updatePosition = () => {
      // ID already has "block-" prefix from nodeFactory
      const element = document.getElementById(selectedId);
      if (element && toolbarRef.current) {
        const rect = element.getBoundingClientRect();
        const toolbarHeight = toolbarRef.current.offsetHeight;
        const toolbarWidth = toolbarRef.current.offsetWidth;

        // Position above the element, centered
        let top = rect.top - toolbarHeight - 8;
        let left = rect.left + (rect.width - toolbarWidth) / 2;

        // If not enough space above, position below
        if (top < 10) {
          top = rect.bottom + 8;
        }

        // Ensure toolbar stays within viewport
        const viewportWidth = window.innerWidth;
        if (left < 10) {
          left = 10;
        } else if (left + toolbarWidth > viewportWidth - 10) {
          left = viewportWidth - toolbarWidth - 10;
        }

        setPosition({ top, left });
      }
    };

    // Update position after a brief delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 10);

    // Update position on scroll or resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [selectedId, node, isPreviewMode]);

  if (!selectedId || !node || isPreviewMode) {
    return null;
  }

  const elementDef = ELEMENTS_BY_TYPE[node.type];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this element?')) {
      deleteNode(selectedId);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(selectedId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The ElementSettings panel in the left sidebar shows the selected element's props
    // This button is mainly for visual feedback
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[9999] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 flex items-center gap-0.5"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Element Type Label */}
      {elementDef && (
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-700">
          {elementDef.label}
        </div>
      )}

      {/* Edit Button */}
      <button
        type="button"
        onClick={handleEdit}
        className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
        title="Edit properties (already selected)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Duplicate Button */}
      <button
        type="button"
        onClick={handleDuplicate}
        className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center justify-center text-green-400 hover:text-green-300 transition-colors"
        title="Duplicate element"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDelete}
        className="p-1.5 hover:bg-red-900/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
        title="Delete element"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
