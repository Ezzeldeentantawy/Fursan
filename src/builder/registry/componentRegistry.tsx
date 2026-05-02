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
 */
export function renderNode(node: BuilderNode, children?: React.ReactNode): React.ReactElement | null {
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

  return React.createElement(Component, { ...node.props, key: node.id }, children);
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
