import { ELEMENTS_BY_TYPE, CONTAINER_TYPES } from '../DynamicPages';

export interface BuilderNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: BuilderNode[];
}

export function createNode(type: string): BuilderNode {
  const elementDef = ELEMENTS_BY_TYPE[type];
  
  if (!elementDef) {
    throw new Error(`Unknown element type: ${type}`);
  }

  const id = `block-${crypto.randomUUID()}`;
  const node: BuilderNode = {
    id,
    type,
    props: { ...elementDef.defaultProps },
  };

  // Add children array for container types
  if (CONTAINER_TYPES.includes(type)) {
    node.children = [];
  }

  return node;
}

export function isContainer(type: string): boolean {
  return CONTAINER_TYPES.includes(type);
}
