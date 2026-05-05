import React from 'react';
import {
  ElementDefinition, ELEMENTS, ELEMENTS_BY_TYPE, ELEMENTS_BY_CATEGORY, CONTAINER_TYPES,
  mergeResponsiveStyles
} from '../DynamicPages';
import { BuilderNode } from '../utils/nodeFactory';

/**
 * Comprehensive propMap: Maps short-form props to their React (camelCase) and CSS (kebab-case) equivalents
 * Used for converting responsive config props to valid styles.
 *
 * This MUST stay in sync with cssPropertyMap in DynamicPages.tsx.
 * propMap is used by renderNode (CSS generation and inline styles).
 * cssPropertyMap in DynamicPages.tsx is used by generateResponsiveStyles (CSS output only).
 */
export const propMap: Record<string, { react: string; css: string }> = {
  // Short-form to React prop / CSS property mappings
  'flexDir': { react: 'flexDirection', css: 'flex-direction' },
  'justify': { react: 'justifyContent', css: 'justify-content' },
  'items': { react: 'alignItems', css: 'align-items' },
  'pt': { react: 'paddingTop', css: 'padding-top' },
  'pr': { react: 'paddingRight', css: 'padding-right' },
  'pb': { react: 'paddingBottom', css: 'padding-bottom' },
  'pl': { react: 'paddingLeft', css: 'padding-left' },
  'mt': { react: 'marginTop', css: 'margin-top' },
  'mr': { react: 'marginRight', css: 'margin-right' },
  'mb': { react: 'marginBottom', css: 'margin-bottom' },
  'ml': { react: 'marginLeft', css: 'margin-left' },
  'rounded': { react: 'borderRadius', css: 'border-radius' },
  'maxWidthC': { react: 'maxWidth', css: 'max-width' },

  // Full-form mappings (pass through)
  'fontSize': { react: 'fontSize', css: 'font-size' },
  'fontWeight': { react: 'fontWeight', css: 'font-weight' },
  'textAlign': { react: 'textAlign', css: 'text-align' },
  'textTransform': { react: 'textTransform', css: 'text-transform' },
  'lineHeight': { react: 'lineHeight', css: 'line-height' },
  'letterSpacing': { react: 'letterSpacing', css: 'letter-spacing' },
  'wordSpacing': { react: 'wordSpacing', css: 'word-spacing' },
  'width': { react: 'width', css: 'width' },
  'height': { react: 'height', css: 'height' },
  'minWidth': { react: 'minWidth', css: 'min-width' },
  'minHeight': { react: 'minHeight', css: 'min-height' },
  'maxWidth': { react: 'maxWidth', css: 'max-width' },
  'maxHeight': { react: 'maxHeight', css: 'max-height' },
  'padding': { react: 'padding', css: 'padding' },
  'margin': { react: 'margin', css: 'margin' },
  'display': { react: 'display', css: 'display' },
  'flexDirection': { react: 'flexDirection', css: 'flex-direction' },
  'flexWrap': { react: 'flexWrap', css: 'flex-wrap' },
  'justifyContent': { react: 'justifyContent', css: 'justify-content' },
  'alignItems': { react: 'alignItems', css: 'align-items' },
  'alignContent': { react: 'alignContent', css: 'align-content' },
  'gap': { react: 'gap', css: 'gap' },
  'rowGap': { react: 'rowGap', css: 'row-gap' },
  'columnGap': { react: 'columnGap', css: 'column-gap' },
  'boxShadow': { react: 'boxShadow', css: 'box-shadow' },
  'zIndex': { react: 'zIndex', css: 'z-index' },
  'visibility': { react: 'visibility', css: 'visibility' },
  'borderRadius': { react: 'borderRadius', css: 'border-radius' },
  'overflow': { react: 'overflow', css: 'overflow' },
  // Spacer & Divider specific
  'spacerHeight': { react: 'height', css: 'height' },
  'dividerWidth': { react: 'width', css: 'width' },
  'dividerThickness': { react: 'borderTopWidth', css: 'border-top-width' },
  // Text columns
  'columns': { react: 'columns', css: 'columns' },
  // Per-item alignment overrides
  'justifySelf': { react: 'justifySelf', css: 'justify-self' },
  'alignSelf': { react: 'alignSelf', css: 'align-self' },
};

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
 * @param activeBreakpoint - Which breakpoint is active in preview (for direct style application)
 */
export function renderNode(
  node: BuilderNode, 
  children?: React.ReactNode, 
  dndProps?: any,
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
  let elementProps: any = { ...node.props, id: node.id, key: node.id, 'data-node-id': node.id };
  
  // ✅ Apply responsive styles with proper breakpoint inheritance (base → sm → md)
  // Uses mergeResponsiveStyles so smaller breakpoints inherit from larger ones.
  // This matches how ContainerComponent handles responsive styles internally.
  if (activeBreakpoint && node.props?.responsive) {
    const mergedStyles = mergeResponsiveStyles(node.props.responsive, activeBreakpoint);
    
    // Apply merged responsive styles to elementProps
    // mergedStyles now contains short-form keys (pt, mt, etc.) from mergeResponsiveStyles
    Object.entries(mergedStyles).forEach(([key, val]) => {
      if (!val) return;
      
      // Always set the short-form key (so components can destructure pt, mt, etc.)
      elementProps[key] = val;
      
      // Also set the React camelCase prop (from propMap) for components that use camelCase
      const mapping = propMap[key];
      if (mapping) {
        const reactProp = mapping.react;
        elementProps[reactProp] = val;
        
        // ✅ Set backward-compat aliases so components reading legacy short-form props also work
        if (reactProp === 'flexDirection') {
          elementProps['flexDir'] = val;
        }
        if (reactProp === 'justifyContent') {
          elementProps['justify'] = val;
        }
        if (reactProp === 'alignItems') {
          elementProps['items'] = val;
        }
        // textAlign → align alias (HeadingComponent, TextComponent, ImageComponent use `align`)
        if (reactProp === 'textAlign') {
          elementProps['align'] = val;
        }
      }
      // Note: If no mapping exists in propMap, the short-form key is already set above
    });
  }
  
  // ✅ Pass activeBreakpoint to component so it can use mergeResponsiveStyles
  if (activeBreakpoint) {
    elementProps.activeBreakpoint = activeBreakpoint;
  }

  // Declare element variable
  let element: React.ReactElement | null = null;
  
  // If DnD props provided, wrap with a div that has id, ref, and all DnD attributes
  // This guarantees the DOM element has the correct id for document.getElementById
  // Using display:contents makes the wrapper "transparent" to CSS layout
  if (dndProps) {
    // Create the inner element with just its own props (no DnD props)
    // BUT: pass the DnD className to the inner element so visual indicators (borders, rings) are visible
    const innerProps: any = {
      ...elementProps,
      // Merge DnD visual classes into the inner element's className
      className: [dndProps.className, elementProps.className].filter(Boolean).join(' '),
    };
    
    delete innerProps.key;
    
    // Create inner element without DnD props
    const innerElement = React.createElement(Component, innerProps, children);
    
    // Wrap with a div that has ALL DnD props for proper drag-and-drop behavior
    // This ensures:
    // 1. document.getElementById(node.id) finds the element
    // 2. Drag event listeners are on the correct element
    // NOTE: Using display:contents to make wrapper transparent to layout
    // For getBoundingClientRect() to work, we need to ensure the wrapper has dimensions
    // We'll use a special data attribute to find the actual content element
    const wrapperProps: any = {
      id: node.id,
      'data-node-id': node.id,
      'data-wrapper': 'true',
      ref: dndProps.ref,
      style: { display: 'contents' }, // Transparent to layout
      // Spread all DnD-related props onto the wrapper
      ...dndProps.attributes,
      ...dndProps.listeners,
      // Merge styles and classNames
      className: [dndProps.className, innerProps.className].filter(Boolean).join(' '),
    };
    
    // Merge styles from dndProps only - do NOT merge innerProps.style
    // innerProps.style contains styles for the INNER element (e.g., zIndex, position)
    // The wrapper has display:contents, and z-index doesn't work on display:contents
    const mergedStyle = {
      ...(wrapperProps.style || {}),
      ...(dndProps.style || {}),
    };
    wrapperProps.style = mergedStyle;
    
    // Handle onClick - call both dndProps.onClick and inner element's onClick
    wrapperProps.onClick = (e: any) => {
      if (dndProps.onClick) dndProps.onClick(e);
      if (innerProps.onClick) innerProps.onClick(e);
    };
    
    // Handle onContextMenu
    wrapperProps.onContextMenu = (e: any) => {
      if (dndProps.onContextMenu) dndProps.onContextMenu(e);
      if (innerProps.onContextMenu) innerProps.onContextMenu(e);
    };
    
    element = React.createElement('div', wrapperProps, innerElement);
  } else {
    // No DnD props, create element normally
    element = React.createElement(Component, elementProps, children);
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
