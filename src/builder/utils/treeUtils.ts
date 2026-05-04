import { BuilderNode } from './nodeFactory';

/**
 * Find a node by ID in the tree (recursive)
 */
export function findNode(tree: BuilderNode, id: string): BuilderNode | null {
  if (tree.id === id) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findNode(child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Find the parent of a node by ID
 * Returns { parent, index } where parent is the parent node and index is the child's position
 */
export function findParentNode(
  tree: BuilderNode,
  id: string,
  parent: BuilderNode | null = null
): { parent: BuilderNode | null; index: number } {
  // Check if the node is a direct child of the current node
  if (tree.children) {
    const index = tree.children.findIndex((child) => child.id === id);
    if (index !== -1) {
      return { parent: tree, index };
    }

    // Recursively search in children
    for (let i = 0; i < tree.children.length; i++) {
      const result = findParentNode(tree.children[i], id, tree);
      if (result.parent !== null || result.index !== -1) {
        return result;
      }
    }
  }

  return { parent: null, index: -1 };
}

/**
 * Insert a node into a parent's children array
 * @param tree - The tree to insert into
 * @param parentId - The ID of the parent node
 * @param node - The node to insert
 * @param index - Optional index to insert at (undefined = append to end)
 */
export function insertNode(tree: BuilderNode, parentId: string, node: BuilderNode, index?: number): BuilderNode {
  console.log('[treeUtils.insertNode] Called with parentId:', parentId, 'index:', index);
  console.log('[treeUtils.insertNode] Node to insert:', node);
  
  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree));

  if (parentId === newTree.id) {
    // Insert into root
    if (!newTree.children) {
      newTree.children = [];
    }
    if (index !== undefined && index >= 0 && index <= newTree.children.length) {
      newTree.children.splice(index, 0, node);
      console.log('[treeUtils.insertNode] Inserted at index', index, 'in root');
    } else {
      newTree.children.push(node);
      console.log('[treeUtils.insertNode] Pushed to end of root');
    }
    return newTree;
  }

  // Find the parent and insert
  let inserted = false;
  
  function insertIntoParent(current: BuilderNode): BuilderNode {
    if (inserted) {
      return current; // Stop recursing once inserted
    }
    
    if (current.id === parentId) {
      if (!current.children) {
        current.children = [];
      }
      if (index !== undefined && index >= 0 && index <= current.children.length) {
        current.children.splice(index, 0, node);
        console.log('[treeUtils.insertNode] Inserted at index', index, 'in parent');
      } else {
        current.children.push(node);
        console.log('[treeUtils.insertNode] Pushed to end of parent');
      }
      inserted = true;
      return current;
    }

    if (current.children) {
      current.children = current.children.map((child) => insertIntoParent(child));
    }

    return current;
  }

  insertIntoParent(newTree);
  
  if (!inserted) {
    console.warn('[treeUtils.insertNode] WARNING: Node was NOT inserted! parentId not found:', parentId);
  }
  
  return newTree;
}

/**
 * Remove a node by ID from the tree
 */
export function removeNode(tree: BuilderNode, id: string): BuilderNode {
  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree));

  function removeFromParent(current: BuilderNode): BuilderNode {
    if (current.children) {
      current.children = current.children.filter((child) => child.id !== id);
      current.children = current.children.map((child) => removeFromParent(child));
    }
    return current;
  }

  return removeFromParent(newTree);
}

/**
 * Update a node's props by merging with new props
 */
export function updateNodeProps(tree: BuilderNode, id: string, props: Record<string, any>): BuilderNode {
  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree));

  function updateInTree(current: BuilderNode): BuilderNode {
    if (current.id === id) {
      console.log('[treeUtils] Before merge - current.props:', current.props);
      console.log('[treeUtils] Props to merge:', props);
      current.props = { ...current.props, ...props };
      console.log('[treeUtils] After merge - current.props:', current.props);
      return current;
    }

    if (current.children) {
      current.children = current.children.map((child) => updateInTree(child));
    }

    return current;
  }

  return updateInTree(newTree);
}

/**
 * Reorder a node (move from one position to another)
 * activeId: the node being dragged
 * overId: the node being dragged over
 */
export function reorderNode(tree: BuilderNode, activeId: string, overId: string): BuilderNode {
  if (activeId === overId) {
    return tree;
  }

  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree));
  
  // Find the active node and its parent
  const { parent: activeParent, index: activeIndex } = findParentNode(newTree, activeId);
  
  if (!activeParent || activeIndex === -1) {
    return tree; // Active node not found
  }
  
  // Extract the active node
  const activeNode = activeParent.children[activeIndex];
  
  // Find the over node and its parent BEFORE removing the active node
  const { parent: overParent, index: overIndex } = findParentNode(newTree, overId);
  
  if (!overParent || overIndex === -1) {
    return tree; // Over node not found
  }
  
  // Now remove the active node
  activeParent.children.splice(activeIndex, 1);
  
  // Adjust overIndex if active was before over in the same parent
  let adjustedOverIndex = overIndex;
  if (activeParent === overParent && activeIndex < overIndex) {
    adjustedOverIndex = overIndex - 1;
  }
  
  // Insert at the adjusted over position
  overParent.children.splice(adjustedOverIndex, 0, activeNode);
  
  return newTree;
}

/**
 * Duplicate a node and insert it after the original
 */
export function duplicateNode(tree: BuilderNode, id: string): BuilderNode {
  // Deep clone the tree
  const newTree = JSON.parse(JSON.stringify(tree));

  // Find the node to duplicate and its parent
  const { parent: nodeParent, index: nodeIndex } = findParentNode(newTree, id);

  if (!nodeParent || nodeIndex === -1) {
    return tree; // Node not found
  }

  // Get the original node
  const originalNode = nodeParent.children[nodeIndex];

  // Create a deep clone with new IDs
  function regenerateIds(node: BuilderNode): BuilderNode {
    const newNode = JSON.parse(JSON.stringify(node));
    newNode.id = crypto.randomUUID();
    
    if (newNode.children) {
      newNode.children = newNode.children.map((child: BuilderNode) => regenerateIds(child));
    }
    
    return newNode;
  }

  const duplicatedNode = regenerateIds(originalNode);

  // Insert after the original
  nodeParent.children.splice(nodeIndex + 1, 0, duplicatedNode);

  return newTree;
}

/**
 * Flatten the tree into an array of all nodes (for sortable context)
 */
export function flattenTree(tree: BuilderNode): BuilderNode[] {
  const result: BuilderNode[] = [];

  function traverse(node: BuilderNode) {
    result.push(node);
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  }

  traverse(tree);
  return result;
}

/**
 * Check if a node is an ancestor of another node
 */
export function isAncestor(tree: BuilderNode, ancestorId: string, descendantId: string): boolean {
  const ancestor = findNode(tree, ancestorId);
  
  if (!ancestor) {
    return false;
  }

  function checkDescendant(node: BuilderNode): boolean {
    if (node.id === descendantId) {
      return true;
    }
    if (node.children) {
      return node.children.some((child) => checkDescendant(child));
    }
    return false;
  }

  return checkDescendant(ancestor);
}
