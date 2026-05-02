import React from 'react';
import { useBuilderStore } from '../store/builderStore';
import { NodeRenderer } from './NodeRenderer';
import { CONTAINER_TYPES } from '../DynamicPages';

export const CanvasInner: React.FC = () => {
  const tree = useBuilderStore((state) => state.tree);
  const select = useBuilderStore((state) => state.select);
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);

  const handleCanvasClick = () => {
    if (!isPreviewMode) {
      select(null);
    }
  };

  return (
    <div
      className="min-h-full p-8"
      onClick={handleCanvasClick}
    >
      {tree.children && tree.children.length > 0 ? (
        <div className="max-w-6xl mx-auto">
          {tree.children.map((child) => (
            <NodeRenderer key={child.id} node={child} />
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
