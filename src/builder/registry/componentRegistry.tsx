import React from 'react';
import { ElementDefinition, ELEMENTS, ELEMENTS_BY_TYPE, ELEMENTS_BY_CATEGORY, CONTAINER_TYPES } from '../DynamicPages';
import { BuilderNode } from '../utils/nodeFactory';

/**
 * Get component by element type
 */
export function getComponent(type: string): React.FC<any> | null {
  const elementDef = ELEMENTS_BY_TYPE[type];
  if (!elementDef) {
    return null;
  }
  return elementDef.component;
}

/**
 * Check if a node type is a container
 */
export function isContainerType(type: string): boolean {
  return CONTAINER_TYPES.includes(type);
}

/**
 * Render a node with its component
 * @param node - The builder node to render
 * @param children - Optional children to pass to the component
 * @param dndProps - Optional DnD props to inject (ref, style, className, onClick, onContextMenu)
 * @param dropZone - Optional drop zone element to pass to container components
 * @param activeBreakpoint - Which breakpoint is active in preview (for direct style application)
 */
export function renderNode(
  node: BuilderNode, 
  children?: React.ReactNode, 
  dndProps?: any,
  dropZone?: React.ReactNode,
  activeBreakpoint?: string  // NEW: which breakpoint is active in preview
): React.ReactElement | null {
  const Component = getComponent(node.type);
  
  if (!Component) {
    return React.createElement(
      'div',
      { 
        key: node.id,
        style: { 
          padding: '16px', 
          border: '2px dashed #ef4444',
          borderRadius: '8px',
          color: '#ef4444',
          textAlign: 'center' as const
        } 
      },
      `Unknown element type: ${node.type}`
    );
  }

  // Create the element props
  let elementProps: any = { ...node.props, id: node.id, key: node.id };
  
  // ✅ NEW: Apply responsive styles directly based on activeBreakpoint
  if (activeBreakpoint && node.props?.responsive) {
    const bpStyles = node.props.responsive[activeBreakpoint];
    
    if (bpStyles) {
      // Apply responsive styles directly to elementProps
      Object.entries(bpStyles).forEach(([key, val]) => {
        if (!val) return;
        
        // Map CSS property names to React prop names
        // Includes both full-form and short-form keys from responsive data
        const propMap: Record<string, string> = {
          // Existing full-form mappings
          'fontSize': 'fontSize',
          'fontWeight': 'fontWeight',
          'textAlign': 'textAlign',
          'lineHeight': 'lineHeight',
          'letterSpacing': 'letterSpacing',
          'width': 'width',
          'height': 'height',
          'minWidth': 'minWidth',
          'minHeight': 'minHeight',
          'maxWidth': 'maxWidth',
          'maxHeight': 'maxHeight',
          'padding': 'padding',
          'margin': 'margin',
          'pt': 'paddingTop',
          'pr': 'paddingRight',
          'pb': 'paddingBottom',
          'pl': 'paddingLeft',
          'mt': 'marginTop',
          'mr': 'marginRight',
          'mb': 'marginBottom',
          'ml': 'marginLeft',
          'display': 'display',
          'flexDirection': 'flexDirection',
          'flexWrap': 'flexWrap',
          'justifyContent': 'justifyContent',
          'alignItems': 'alignItems',
          'gap': 'gap',
          'boxShadow': 'boxShadow',
          'zIndex': 'zIndex',
          'visibility': 'visibility',
          'borderRadius': 'borderRadius',
          'overflow': 'overflow',
          'textTransform': 'textTransform',
          'wordSpacing': 'wordSpacing',
          
          // ✅ SHORT FORM MAPPINGS (from responsive data in DynamicPages.tsx)
          'flexDir': 'flexDirection',        // ← Maps short form to React prop
          'justify': 'justifyContent',       // ← Maps short form to React prop
          'items': 'alignItems',             // ← Maps short form to React prop
        };
        
        const reactProp = propMap[key];
        
        if (reactProp && val) {
          elementProps[reactProp] = val;
          
          // ✅ ALSO set the original short form prop name for backward compatibility
          // This ensures components that read `flexDir` will also get the value
          if (reactProp === 'flexDirection') {
            elementProps['flexDir'] = val;
          }
          if (reactProp === 'justifyContent') {
            elementProps['justify'] = val;
          }
          if (reactProp === 'alignItems') {
            elementProps['items'] = val;
            elementProps['align'] = val;  // For HeadingComponent which uses `align`
          }
          if (reactProp === 'textAlign') {
            elementProps['align'] = val;  // For HeadingComponent/TextComponent which use `align`
          }
        }
      });
    }
  }
  
  // Pass dropZone as a prop if provided and node is a container
  if (dropZone && CONTAINER_TYPES.includes(node.type)) {
    elementProps.dropZone = dropZone;
  }

  // Create the element
  let element = React.createElement(Component, elementProps, children);
  
  // If DnD props provided, clone element and inject props
  if (dndProps) {
    const mergedStyle = { ...(element.props.style || {}), ...(dndProps.style || {}) };
    const mergedClassName = [element.props.className, dndProps.className].filter(Boolean).join(' ');
    
    element = React.cloneElement(element, {
      ref: dndProps.ref,
      style: mergedStyle,
      className: mergedClassName,
      onClick: dndProps.onClick,
      onContextMenu: dndProps.onContextMenu,
    });
  }
  
  return element;
}

/**
 * Get all elements
 */
export function getAllElements(): ElementDefinition[] {
  return ELEMENTS;
}

/**
 * Get element definition by type
 */
export function getElementDefinition(type: string): ElementDefinition | undefined {
  return ELEMENTS_BY_TYPE[type];
}

/**
 * Get elements grouped by category
 */
export function getElementsByCategory(): Record<string, ElementDefinition[]> {
  return ELEMENTS_BY_CATEGORY;
}

// Re-export everything from DynamicPages
export {
  ELEMENTS,
  ELEMENTS_BY_TYPE,
  ELEMENTS_BY_CATEGORY,
  CONTAINER_TYPES,
};

export type { ElementDefinition };
