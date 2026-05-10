/**
 * Fursan CMS - Page Builder
 * 
 * A professional drag-and-drop page builder similar to Elementor.
 * Built with React, @dnd-kit, Zustand, and TipTap.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useBuilderStore } from './store/builderStore';
import { WidgetPanel } from './components/WidgetPanel';
import { CanvasInner } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Navigator } from './components/Navigator';
import { DraggablePanel } from './components/DraggablePanel';
import { breakpoints } from './DynamicPages';
import { TemplatePicker } from './components/TemplatePicker';
import { FloatingToolbar } from './components/FloatingToolbar';
import { CustomCodeModal } from './components/CustomCodeModal';
import pagesApi from '../api/pagesApi';
import { createNode, isContainer } from './utils/nodeFactory';
import { CONTAINER_TYPES, ELEMENTS_BY_TYPE } from './DynamicPages';
import type { BuilderNode } from './utils/nodeFactory';
import { findNode, findParentNode } from './utils/treeUtils';
import templatesApi from '../api/templatesApi';
import siteMenusApi from '../api/siteMenusApi';

// Store subscription for debugging tree updates (outside component)
if (typeof window !== 'undefined') {
  useBuilderStore.subscribe(
    (state) => state.tree,
    (tree, prevTree) => {
      console.log('[Store] Tree changed, children count:', tree.children?.length);
      console.log('[Store] Prev children count:', prevTree.children?.length);
    }
  );
}

export const Builder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isTemplateMode = location.pathname.includes('/templates/');
  
  const setTree = useBuilderStore((state) => state.setTree);
  const tree = useBuilderStore((state) => state.tree);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const resetTree = useBuilderStore((state) => state.resetTree);
  const activeBp = useBuilderStore((state) => state.activeBp);
  const setActiveBp = useBuilderStore((state) => state.setActiveBp);
  const setSiteMenus = useBuilderStore((state) => state.setSiteMenus);
  
  const [pageTitle, setPageTitle] = useState<string>('');
  const [siteDomain, setSiteDomain] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>('');
  const [isDefaultSite, setIsDefaultSite] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
  const [pageData, setPageData] = useState<any>(null);
  
  // Drag state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragPointerPosition, setDragPointerPosition] = useState<{ x: number; y: number } | null>(null);

  // Navigator panel visibility
  const [showNavigator, setShowNavigator] = useState(false);

  // Template picker visibility
  const [showTemplates, setShowTemplates] = useState(false);

  // Custom Code modal visibility
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);

  // Ref to prevent multiple simultaneous loads
  const isLoadingRef = useRef(false);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Helper function to load content for a specific language
  const loadContentForLanguage = (lang: 'en' | 'ar', data: any) => {
    if (!data) {
      console.log('[Builder] No page data provided to loadContentForLanguage');
      return;
    }
    
    console.log('[Builder] loadContentForLanguage - lang:', lang);
    console.log('[Builder] loadContentForLanguage - data.content:', data.content);
    console.log('[Builder] loadContentForLanguage - data.content_ar:', data.content_ar);
    
    // Determine which content to load
    let contentToLoad = null;
    if (lang === 'ar' && data.content_ar) {
      contentToLoad = data.content_ar;
    } else if (lang === 'en' && data.content) {
      contentToLoad = data.content;
    }
    
    console.log('[Builder] contentToLoad:', contentToLoad);
    console.log('[Builder] typeof contentToLoad:', typeof contentToLoad);
    console.log('[Builder] JSON.stringify contentToLoad:', JSON.stringify(contentToLoad));
    
    // Handle different possible structures
    // Structure 1: { elements: [...], customCss: "...", customJs: "..." }
    // Structure 2: [...] (direct array)
    // Structure 3: JSON string
    
    let elements = [];
    let customCss = null;
    let customJs = null;
    
    if (typeof contentToLoad === 'string') {
      // Try to parse as JSON
      try {
        contentToLoad = JSON.parse(contentToLoad);
        console.log('[Builder] Parsed contentToLoad from string:', contentToLoad);
      } catch (e) {
        console.error('[Builder] Failed to parse contentToLoad:', e);
        resetTree();
        return;
      }
    }
    
    if (Array.isArray(contentToLoad)) {
      // Structure 2: Direct array
      console.log('[Builder] contentToLoad is a direct array');
      elements = contentToLoad;
    } else if (contentToLoad && typeof contentToLoad === 'object') {
      // Structure 1 or 3
      if (contentToLoad.elements && Array.isArray(contentToLoad.elements)) {
        console.log('[Builder] contentToLoad has elements array');
        elements = contentToLoad.elements;
        customCss = contentToLoad.customCss || null;
        customJs = contentToLoad.customJs || null;
      } else {
        console.warn('[Builder] contentToLoad has unexpected structure:', contentToLoad);
      }
    }
    
    console.log('[Builder] Final elements:', elements);
    console.log('[Builder] Final customCss:', customCss);
    console.log('[Builder] Final customJs:', customJs);
    console.log('[Builder] elements.length:', elements.length);
    
    // Load customCss and customJs
    useBuilderStore.getState().setCustomCss(customCss);
    useBuilderStore.getState().setCustomJs(customJs);
    
    // Load elements
    if (elements.length > 0) {
      // Deduplicate elements by ID to prevent duplicates
      const seenIds = new Set();
      const uniqueElements = elements.filter((el: any) => {
        if (!el.id || seenIds.has(el.id)) {
          console.warn('[Builder] Duplicate or missing ID detected:', el);
          return false;
        }
        seenIds.add(el.id);
        return true;
      });
      
      if (uniqueElements.length !== elements.length) {
        console.warn(`[Builder] Removed ${elements.length - uniqueElements.length} duplicate elements`);
      }
      
      const rootTree: BuilderNode = {
        id: 'root',
        type: 'container',
        props: {
          bgColor: 'transparent', bgImage: '', bgSize: 'cover',
          width: '', height: '', minWidth: '', minHeight: '',
          maxWidth: '', maxHeight: '', borderRadius: '',
          borderWidth: '0px', borderColor: '#e2e8f0', borderStyle: 'none',
          padding: '16px', direction: 'column', align: 'stretch',
          justify: 'flex-start', gap: '16px',
        },
        children: uniqueElements,
      };
      setTree(rootTree);
      return;
    }
    
    resetTree();
  };

  // Handle language switch
  const handleLanguageSwitch = async (lang: 'en' | 'ar') => {
    if (lang === currentLang) return;
    
    console.log('[Builder] Switching language to:', lang);
    
    setCurrentLang(lang);
    
    // Reload page data with correct lang parameter
    if (id && id !== 'new') {
      try {
        // First, try to get the page with the new language
        const response = await pagesApi.getOne(id, lang);
        const data = response.data?.data || response.data;
        console.log('[Builder] Reloaded page data:', data);
        setPageData(data);
        loadContentForLanguage(lang, data);
      } catch (error) {
        console.error('[Builder] Failed to reload page data:', error);
      }
    }
  };

  // Load page data on mount
  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('[Builder] Load already in progress, skipping');
      return;
    }
    
    let cancelled = false;
    
    const loadPage = async () => {
      if (!id || id === 'new') {
        resetTree();
        setPageTitle('');
        return;
      }

      // Set loading ref BEFORE any async operations
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        if (isTemplateMode) {
          // Load template content
          console.log('[Builder] Loading template with id:', id);
          const response = await templatesApi.getOne(id);
          if (cancelled) return;
          const data = response.data?.data || response.data;
          console.log('[Builder] Template data received:', data);
          
          if (data) {
            setPageTitle(data.title || '');
            setSiteDomain('templates');
            setPageSlug('');
            setIsDefaultSite(false);

            // Set pageData so the menu-fetching useEffect can get site_id
            // Templates have a nullable site_id field (global templates may be null)
            if (data.site_id) {
              setPageData({ site: { id: data.site_id } });
            } else {
              setPageData(null);
            }
            
            // Templates have a single content field (no language variants)
            // Structure: content = { elements: [...], customCss: "...", customJs: "..." }
            const templateContent = data.content || { elements: [] };
            loadContentForLanguage(currentLang, { content: templateContent });
          }
        } else {
          // Load page (existing behavior)
          console.log('[Builder] Loading page with id:', id);
          const response = await pagesApi.getOne(id);
          console.log('[Builder] Page API response:', response);
          
          // Check if this request was cancelled (component unmounted or id changed)
          if (cancelled) {
            return;
          }
          
          const data = response.data?.data || response.data;
          console.log('[Builder] Page data received:', data);
            
            if (data) {
              setPageData(data);
              setPageTitle(data.title || '');
              setSiteDomain(data.site?.domain || 'default');
              setPageSlug(data.slug || data.id || '');
              setIsDefaultSite(data.site?.is_default || false);
            
            // Load content based on current language
            loadContentForLanguage(currentLang, data);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load:', error);
          if (isTemplateMode) {
            alert('Failed to load template. Please try again.');
          } else {
            alert('Failed to load page. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadPage();
    
    // Cleanup function to cancel the request if component unmounts or id changes
    return () => {
      cancelled = true;
    };
  }, [id, setTree, resetTree]);

  // Track mouse position during drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (activeDragId) {
        setDragPointerPosition({ x: e.clientX, y: e.clientY });
      }
    };

    if (activeDragId) {
      document.addEventListener('pointermove', handlePointerMove);
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [activeDragId]);

  // Apply Custom CSS to builder preview
  const customCss = useBuilderStore((state) => state.customCss);
  
  useEffect(() => {
    if (!customCss) {
      // Remove custom CSS if it exists
      const existingStyle = document.getElementById('builder-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      return;
    }
    
    // Create or update a style element for custom CSS
    let styleEl = document.getElementById('builder-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'builder-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = customCss;
    
    return () => {
      // Don't remove on cleanup - let the next effect handle it
      // This prevents flickering when switching between pages
    };
  }, [customCss]);

  // Apply Custom JS to builder preview
  const customJs = useBuilderStore((state) => state.customJs);
  
  useEffect(() => {
    if (!customJs) {
      // Remove custom JS if it exists
      const existingScript = document.getElementById('builder-custom-js');
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }
    
    try {
      // Remove old script if exists
      const oldScript = document.getElementById('builder-custom-js');
      if (oldScript) oldScript.remove();
      
      // Create and execute new script
      const scriptEl = document.createElement('script');
      scriptEl.id = 'builder-custom-js';
      scriptEl.textContent = customJs;
      document.body.appendChild(scriptEl);
    } catch (error) {
      console.error('[Builder] Custom JS error:', error);
    }
    
    return () => {
      // Don't remove on cleanup - let the next effect handle it
    };
  }, [customJs]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    useBuilderStore.getState().setActiveDragId(active.id as string);
    const fromPanel = active.data.current?.fromPanel;
    if (fromPanel) {
      setActiveDragType(active.data.current?.type);
      useBuilderStore.getState().setActiveDragType(active.data.current?.type);
    } else {
      setActiveDragType(null);
      useBuilderStore.getState().setActiveDragType(null);
    }
    // Initialize drag pointer position
    const startEvent = event.activatorEvent as PointerEvent;
    if (startEvent) {
      setDragPointerPosition({ x: startEvent.clientX, y: startEvent.clientY });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(over.id as string);
    }
    
    // Use mouse position to find which container the cursor is over
    // This works for ALL containers including empty ones (no collision needed)
    if (dragPointerPosition) {
      const { x, y } = dragPointerPosition;
      const elements = document.elementsFromPoint(x, y);
      
      // Walk through elements under cursor, find the deepest container
      let foundContainerId: string | null = null;
      for (const el of elements) {
        // Check element itself
        const nodeId = el.getAttribute('data-node-id');
        if (nodeId) {
          const node = findNode(useBuilderStore.getState().tree, nodeId);
          if (node && CONTAINER_TYPES.includes(node.type)) {
            foundContainerId = nodeId;
            break;
          }
        }
        // Walk up parent chain to find container
        let parent: Element | null = el.parentElement;
        while (parent) {
          const parentNodeId = parent.getAttribute('data-node-id');
          if (parentNodeId) {
            const node = findNode(useBuilderStore.getState().tree, parentNodeId);
            if (node && CONTAINER_TYPES.includes(node.type)) {
              foundContainerId = parentNodeId;
              break;
            }
          }
          parent = parent.parentElement;
        }
        if (foundContainerId) break;
      }
      
      useBuilderStore.getState().setOverContainerId(foundContainerId);
    }
  };

  /**
   * Calculate the correct drop index within a container based on mouse position
   * FIX for Issue 2: Insert at correct position instead of always at the bottom
   */
  const calculateDropIndexInContainer = (containerId: string, mouseY: number): number => {
    // Get the container's children from the tree (source of truth)
    const currentTree = useBuilderStore.getState().tree;
    const containerNode = findNode(currentTree, containerId);
    
    if (!containerNode || !containerNode.children || containerNode.children.length === 0) {
      return 0; // Empty container, insert at 0
    }
    
    const children = containerNode.children;
    
    // Find the child that the mouse is closest to
    let closestIndex = children.length; // Default: insert at end
    let closestDistance = Infinity;

    children.forEach((child, index) => {
      // Find the DOM element by ID (the wrapper div with display:contents)
      const childElement = document.getElementById(child.id);
      if (!childElement) return;
      
      // With display:contents, getBoundingClientRect() might return zero dimensions
      // We need to find the first child element that has actual dimensions
      let targetElement: Element | null = childElement;
      
      // If the wrapper has no dimensions, try to find the first child with dimensions
      const rect = childElement.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        // Find the first child element that has dimensions
        const childrenWithDimensions = childElement.querySelectorAll('*');
        for (let i = 0; i < childrenWithDimensions.length; i++) {
          const childRect = childrenWithDimensions[i].getBoundingClientRect();
          if (childRect.width > 0 || childRect.height > 0) {
            targetElement = childrenWithDimensions[i];
            break;
          }
        }
      }
      
      const targetRect = targetElement.getBoundingClientRect();
      
      // Skip elements with zero dimensions (e.g., during drag, hidden elements)
      if (targetRect.width === 0 && targetRect.height === 0) return;
      
      const distance = Math.abs(mouseY - targetRect.top - targetRect.height / 2);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        // If mouse is above the middle of this child, insert before it
        // If mouse is below the middle, insert after it
        if (mouseY < targetRect.top + targetRect.height / 2) {
          closestIndex = index;
        } else {
          closestIndex = index + 1;
        }
      }
    });

    return closestIndex;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;
      
      setActiveDragId(null);
      setActiveDragType(null);
      setOverId(null);
      setDragPointerPosition(null);
      useBuilderStore.getState().setActiveDragId(null);
      useBuilderStore.getState().setActiveDragType(null);
      useBuilderStore.getState().setOverContainerId(null);

      if (!over) {
        return;
      }

      const activeId = active.id as string;
      const fromPanel = active.data.current?.fromPanel;

      // Get the drop target ID
      const overId = over.id as string;
      
      // Get fresh tree state to avoid stale closure
      const currentTree = useBuilderStore.getState().tree;
      
      // Check if dropping over a container
      const isOverContainer = over.data.current?.isContainer || overId === 'root' || CONTAINER_TYPES.includes(findNode(currentTree, overId)?.type || '');

      if (fromPanel) {
        const elementType = active.data.current?.type;
        if (!elementType) {
          return;
        }

        const newNode = createNode(elementType);
        
        // Handle dropzone-{parentId}-{index} IDs (dashed drop targets between elements)
        // parentId itself contains dashes (e.g. block-uuid), so split from the right
        if (overId.startsWith('dropzone-')) {
          const withoutPrefix = overId.slice('dropzone-'.length);
          const lastDash = withoutPrefix.lastIndexOf('-');
          const insertIndex = parseInt(withoutPrefix.slice(lastDash + 1), 10);
          const parentId = withoutPrefix.slice(0, lastDash);
          console.log('[handleDragEnd] Dropping on dropzone, parent:', parentId, 'index:', insertIndex);
          addNode(parentId, newNode, insertIndex);
          return;
        }
        
        if (isOverContainer) {
          // FIX Issue 2: Calculate correct drop index within container based on mouse position
          // Use the tracked pointer position
          const mouseY = dragPointerPosition?.y || 0;
          
          const dropIndex = calculateDropIndexInContainer(overId, mouseY);
          
          if (dropIndex >= 0) {
            console.log('[handleDragEnd] Adding to container:', overId, 'at index:', dropIndex);
            addNode(overId, newNode, dropIndex);
          } else {
            // Fallback: add to end
            console.log('[handleDragEnd] Adding to container:', overId, 'at end');
            addNode(overId, newNode);
          }
        } else {
          // Dropping on an existing element - find parent and insert AFTER the target
          const { parent, index } = findParentNode(currentTree, overId);
          
          if (parent && index !== -1) {
            // Insert AFTER the target element (index + 1)
            const insertIndex = index + 1;
            console.log('[handleDragEnd] Inserting at index:', insertIndex, 'in parent:', parent.id);
            addNode(parent.id, newNode, insertIndex);
          } else {
            // Fallback: add to root
            console.log('[handleDragEnd] Fallback: adding to root');
            addNode('root', newNode);
          }
        }
      } else {
        // Reorder existing node
        if (activeId !== overId) {
          moveNode(activeId, overId);
        }
      }
    } catch (error) {
      console.error('[handleDragEnd] ERROR:', error);
    }
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!id || id === 'new') {
      if (isTemplateMode) {
        alert('Please create the template first from the Templates page.');
      } else {
        alert('Please create the page first.');
      }
      return;
    }

    setIsSaving(true);
    try {
      const elements = tree.children || [];
      
      // Deduplicate elements before saving
      const seenIds = new Set();
      const uniqueElements = elements.filter((el: any) => {
        if (!el.id || seenIds.has(el.id)) {
          console.warn('[Builder] Removing duplicate element before save:', el);
          return false;
        }
        seenIds.add(el.id);
        return true;
      });
      
      if (uniqueElements.length !== elements.length) {
        console.warn(`[Builder] Removed ${elements.length - uniqueElements.length} duplicates before saving`);
      }
      
      const contentData = { 
        elements: uniqueElements,
        customCss: useBuilderStore.getState().customCss || null,
        customJs: useBuilderStore.getState().customJs || null,
      };
      
      console.log('[Builder] Saving contentData:', contentData);
      
      if (isTemplateMode) {
        // Save as template content
        await templatesApi.updateContent(id, contentData);
        alert('Template saved successfully!');
      } else {
        // Pass lang parameter so Laravel knows which field to update
        console.log('[Builder] PUT request lang:', currentLang);
        await pagesApi.update(id, contentData, currentLang);
        alert('Page saved successfully!');
      }
      
      // Update the tree with deduplicated elements
      if (uniqueElements.length !== elements.length) {
        const updatedTree = { ...tree, children: uniqueElements };
        setTree(updatedTree);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      if (isTemplateMode) {
        alert('Failed to save template. Please try again.');
      } else {
        alert('Failed to save page. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }, [id, tree, setTree, currentLang, isTemplateMode]);

  // Site ID from loaded page data (templates need this)
  const siteId = pageData?.site?.id || null;

  // Fetch site menus when siteId changes
  useEffect(() => {
    if (!siteId) {
      setSiteMenus([]);
      return;
    }

    let cancelled = false;

    const loadMenus = async () => {
      try {
        const data = await siteMenusApi.getMenus(siteId);
        if (!cancelled) {
          setSiteMenus(data.menus || []);
        }
      } catch (error) {
        console.error('[Builder] Failed to load site menus:', error);
        if (!cancelled) {
          setSiteMenus([]);
        }
      }
    };

    loadMenus();

    return () => {
      cancelled = true;
    };
  }, [siteId, setSiteMenus]);

  // Template handlers
  const handleTemplateSelect = (content: { elements: any[] }) => {
    // Append template elements to the root of the current page tree
    // (instead of replacing the entire tree)
    if (content?.elements && content.elements.length > 0) {
      const currentTree = useBuilderStore.getState().tree;
      const updatedTree = JSON.parse(JSON.stringify(currentTree));
      
      // Regenerate IDs for template elements to avoid conflicts
      const regenerateIds = (node: any): any => {
        const newNode = { ...node, id: crypto.randomUUID() };
        if (newNode.children && newNode.children.length > 0) {
          newNode.children = newNode.children.map((child: any) => regenerateIds(child));
        }
        return newNode;
      };
      
      const newElements = content.elements.map((el: any) => regenerateIds(el));
      
      if (!updatedTree.children) updatedTree.children = [];
      updatedTree.children.push(...newElements);
      
      setTree(updatedTree);
    }
    setShowTemplates(false);
  };

  const handleSaveAsTemplate = async (name: string, type: 'header' | 'footer' | 'block') => {
    const currentTree = useBuilderStore.getState().tree;
    const currentSiteId = siteId;
    
    if (!currentSiteId) {
      alert('Cannot save template: no site context. Please save the page first.');
      return;
    }

    try {
      const content = { elements: currentTree.children || [] };
      
      if (content.elements.length === 0) {
        alert('Cannot save an empty page as a template. Add some elements first.');
        return;
      }

      await templatesApi.create({
        site_id: currentSiteId,
        title: name,
        content,
        type,
      });
      
      alert(`Template "${name}" saved successfully!`);
    } catch (error) {
      console.error('[Builder] Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await templatesApi.delete(id);
    } catch (error) {
      console.error('[Builder] Failed to delete template:', error);
      alert('Failed to delete template.');
    }
  };

  const renderDragOverlay = () => {
    if (!activeDragId) return null;
    if (activeDragType) {
      // Find the element definition to get the label and icon
      const elementDef = ELEMENTS_BY_TYPE[activeDragType];
      const IconComponent = elementDef?.icon;
      return (
        <div className="flex items-center gap-2 bg-slate-800 border-2 border-blue-400 rounded-xl p-3 shadow-lg opacity-90">
          {IconComponent && <IconComponent size={18} className="text-blue-400" />}
          <span className="text-xs font-bold text-slate-300">Add: {activeDragType}</span>
        </div>
      );
    }
    return (
      <div className="bg-white border-2 border-blue-400 rounded-md p-3 shadow-lg opacity-90">
        Moving element
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={(event) => {
        console.log('[DndContext] onDragEnd fired!');
        handleDragEnd(event);
      }}
    >
      <div className="h-screen flex flex-col bg-slate-100">
        <Toolbar
          pageTitle={pageTitle}
          siteDomain={siteDomain}
          pageSlug={pageSlug}
          isDefaultSite={isDefaultSite}
          onSave={handleSave}
          isSaving={isSaving}
          onToggleNavigator={() => setShowNavigator(!showNavigator)}
          showNavigator={showNavigator}
          onToggleTemplates={() => setShowTemplates(!showTemplates)}
          onToggleCustomCode={() => setShowCustomCodeModal(true)}
          currentLang={currentLang}
          onLanguageSwitch={handleLanguageSwitch}
          pageData={pageData}
        />
        
        {/* Breakpoint Preview Bar - Dark Theme */}
        <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mr-2">Preview:</span>
          {breakpoints.map((bp) => {
            const Icon = bp.icon;
            return (
              <button
                key={bp.key}
                onClick={() => setActiveBp(bp.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl transition-all ${
                  activeBp === bp.key
                    ? 'bg-blue-500 text-white font-medium shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                }`}
                title={`${bp.label} (${bp.width})`}
              >
                <Icon size={12} />
                <span>{bp.label}</span>
                <span className="text-[10px] opacity-75">{bp.width}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <WidgetPanel />
          
          <div className="flex-1 overflow-auto bg-white">
            <CanvasInner activeBreakpoint={activeBp} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {renderDragOverlay()}
      </DragOverlay>

      {/* Floating Toolbar for selected element */}
      <FloatingToolbar />
       
        {/* Navigator Panel */}
        {showNavigator && (
          <DraggablePanel
            title="Layers"
            defaultPosition={{ x: window.innerWidth - 350, y: 100 }}
            width={280}
            height={500}
            onClose={() => setShowNavigator(false)}
          >
            <Navigator tree={tree} onClose={() => setShowNavigator(false)} />
          </DraggablePanel>
        )}

        {/* Template Picker Modal */}
        {showTemplates && siteId && (
          <TemplatePicker
            siteId={siteId}
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
            onSaveCurrent={handleSaveAsTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}
        {showTemplates && !siteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplates(false)}>
            <div className="bg-slate-900 rounded-xl p-8 shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
              <p className="text-white text-center">Please save the page first before accessing templates.</p>
              <div className="flex justify-center mt-4">
                <button onClick={() => setShowTemplates(false)} className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-600 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Code Modal */}
        <CustomCodeModal 
          isOpen={showCustomCodeModal} 
          onClose={() => setShowCustomCodeModal(false)} 
        />
    </DndContext>
  );
};

export default Builder;

export { useBuilderStore } from './store/builderStore';
export type { BuilderNode } from './utils/nodeFactory';
