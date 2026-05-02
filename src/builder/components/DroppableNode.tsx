import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../store/builderStore';
import { ELEMENTS_BY_TYPE, CONTAINER_TYPES, generateResponsiveStyles } from '../DynamicPages';
import { renderNode } from '../registry/componentRegistry';
import { BuilderNode } from '../utils/nodeFactory';
import { Breakpoint } from '../DynamicPages';
import { breakpoints } from '../DynamicPages';

interface DroppableNodeProps {
  node: BuilderNode;
  isSelected: boolean;
  isPreviewMode: boolean;
  activeBreakpoint?: Breakpoint;
  children?: React.ReactNode;
}

// Helper to get responsive styles for a given breakpoint
const getResponsiveStyles = (node: BuilderNode, breakpoint: Breakpoint): React.CSSProperties => {
  const responsive = node.props?.responsive;
  if (!responsive || !responsive[breakpoint]) {
    return {};
  }

  const bpStyles = responsive[breakpoint];
  const styles: React.CSSProperties = {};

  // Map responsive props to CSS properties
  const styleMap: Record<string, keyof React.CSSProperties> = {
    fontSize: 'fontSize',
    fontWeight: 'fontWeight',
    textAlign: 'textAlign',
    width: 'width',
    height: 'height',
    minWidth: 'minWidth',
    minHeight: 'minHeight',
    maxWidth: 'maxWidth',
    maxHeight: 'maxHeight',
    padding: 'padding',
    margin: 'margin',
    pt: 'paddingTop',
    pr: 'paddingRight',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    mt: 'marginTop',
    mr: 'marginRight',
    mb: 'marginBottom',
    ml: 'marginLeft',
    lineHeight: 'lineHeight',
    letterSpacing: 'letterSpacing',
    display: 'display',
    flexDirection: 'flexDirection',
    justifyContent: 'justifyContent',
    alignItems: 'alignItems',
    gap: 'gap',
    boxShadow: 'boxShadow',
    zIndex: 'zIndex',
    visibility: 'visibility',
    borderRadius: 'borderRadius',
    overflow: 'overflow',
  };

  Object.entries(bpStyles).forEach(([key, value]) => {
    const cssProp = styleMap[key];
    if (cssProp && value) {
      (styles as any)[cssProp] = value;
    }
  });

  return styles;
};

// Helper to cascade styles from smaller to larger breakpoints
const getCascadedStyles = (node: BuilderNode, activeBreakpoint: Breakpoint): React.CSSProperties => {
  const breakpointKeys = breakpoints.map(bp => bp.key);
  const currentIndex = breakpointKeys.indexOf(activeBreakpoint);
  
  // Start with base styles, then cascade up to the active breakpoint
  let cascadedStyles: Record<string, any> = {};
  
  for (let i = 0; i <= currentIndex; i++) {
    const bp = breakpointKeys[i];
    const bpStyles = node.props?.responsive?.[bp];
    if (bpStyles) {
      cascadedStyles = { ...cascadedStyles, ...bpStyles };
    }
  }
  
  // Convert to CSS properties
  return getResponsiveStyles(node, activeBreakpoint) || cascadedStyles;
};

export const DroppableNode: React.FC<DroppableNodeProps> = ({
  node,
  isSelected,
  isPreviewMode,
  activeBreakpoint = 'md',
  children,
}) => {
  const select = useBuilderStore((state) => state.select);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);

  const isContainer = CONTAINER_TYPES.includes(node.type);
  const elementDef = ELEMENTS_BY_TYPE[node.type];

  // Set up sortable for reordering
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

  // Get responsive styles for the active breakpoint
  const responsiveStyles = getCascadedStyles(node, activeBreakpoint);

  // Generate responsive CSS style element for media query-based styles
  // This handles responsive props defined in node.props.responsive (e.g., display: flex at md breakpoint)
  const responsiveStyleElement = generateResponsiveStyles(node.id, node.props?.responsive);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      select(node.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this element?')) {
      deleteNode(node.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(node.id);
  };

  // Combine refs
  const setRefs = (el: HTMLElement | null) => {
    setSortableRef(el);
    if (isContainer) {
      setDroppableRef(el);
    }
  };

  return (
    <>
      {/* Inject responsive styles for this node */}
      {responsiveStyleElement}
      
      <div
        ref={setRefs}
        style={{ ...style, ...responsiveStyles }}
        {...attributes}
        className={`
          relative group mb-2
          ${isSelected && !isPreviewMode ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isOver && isContainer && !isPreviewMode ? 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50/50' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        onClick={handleClick}
      >
      {/* Drag Handle & Controls - only show when not in preview mode */}
      {!isPreviewMode && (
        <>
          {/* Drag Handle */}
          <div
            {...listeners}
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 cursor-grab flex items-center justify-center z-10 transition-opacity"
            title="Drag to reorder"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 6a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm0 6a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm6-8a1 1 0 01-2 0V3a1 1 0 012 0v1zm0 6a1 1 0 01-2 0v-1a1 1 0 012 0v1zm0 6a1 1 0 01-2 0v-1a1 1 0 012 0v1z" />
            </svg>
          </div>

          {/* Selected Controls */}
          {isSelected && (
            <div className="absolute -top-8 right-0 flex gap-1 z-20">
              <button
                type="button"
                onClick={handleDuplicate}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="Duplicate"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                title="Delete"
              >
                Delete
              </button>
            </div>
          )}

          {/* Element Label */}
          {elementDef && (
            <div className="absolute -top-5 left-0 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {elementDef.label}
            </div>
          )}
        </>
      )}

      {/* Render the actual node content */}
      <div className="w-full">
        {renderNode(node, children)}
      </div>

       {/* Drop zone indicator for containers - only show in edit mode */}
       {isContainer && !isPreviewMode && (
         <div
           className={`min-h-[60px] border-2 border-dashed rounded p-2 mt-1 transition-colors ${
             isOver
               ? 'border-blue-400 bg-blue-50/70'
               : 'border-gray-300 bg-transparent'
           }`}
         >
           {/* Children are already rendered by renderNode above, so we don't render them again here */}
           {(!children || (Array.isArray(children) && children.length === 0)) && (
             <div className={`text-center text-sm py-6 transition-colors ${
               isOver ? 'text-blue-500 font-medium' : 'text-gray-400'
             }`}>
               {isOver ? 'Drop here' : 'Drop elements here'}
             </div>
           )}
         </div>
       )}
     </div>
   </>
  );
};
