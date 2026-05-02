import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface DraggablePanelProps {
  children: ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: number | string;
  height?: number | string;
  title?: string;
  onClose?: () => void;
  minWidth?: number;
  minHeight?: number;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  defaultPosition = { x: 100, y: 100 },
  width = 250,
  height = 400,
  title = 'Panel',
  onClose,
  minWidth = 200,
  minHeight = 200,
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelSize, setPanelSize] = useState({ width, height });
  const panelRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if clicking on the drag handle
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - (rect?.left || position.x),
        y: e.clientY - (rect?.top || position.y),
      });
      e.preventDefault();
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 50, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.y));
        
        setPosition({
          x: newX,
          y: newY,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);
  
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = typeof panelSize.width === 'number' ? panelSize.width : parseInt(panelSize.width as string) || width;
    const startHeight = typeof panelSize.height === 'number' ? panelSize.height : parseInt(panelSize.height as string) || height;
    
    const handleResizeMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newWidth = Math.max(minWidth, startWidth + deltaX);
      const newHeight = Math.max(minHeight, startHeight + deltaY);
      
      setPanelSize({
        width: newWidth,
        height: newHeight,
      });
    };
    
    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
  };
  
  const getWidth = () => {
    if (isCollapsed) return 250;
    return panelSize.width;
  };
  
  const getHeight = () => {
    if (isCollapsed) return 40;
    return panelSize.height;
  };
  
  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: getWidth(),
        height: getHeight(),
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col"
    >
      {/* Header / Drag Handle */}
      <div
        className="drag-handle flex items-center justify-between p-2 bg-gray-100 cursor-move border-b select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-semibold truncate">{title}</span>
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '□' : '—'}
          </button>
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-xs text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden relative">
          {children}
          
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{
              background: 'linear-gradient(135deg, transparent 50%, #9ca3af 50%)',
            }}
            title="Resize panel"
          />
        </div>
      )}
    </div>
  );
};
