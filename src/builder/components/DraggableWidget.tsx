import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ElementDefinition } from '../DynamicPages';

interface DraggableWidgetProps {
  element: ElementDefinition;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ element }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `widget-${element.type}`,
    data: {
      fromPanel: true,
      type: element.type,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  // Get the icon component
  const IconComponent = element.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-md
        cursor-grab hover:border-blue-400 hover:shadow-sm transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      style={style}
    >
      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center flex-shrink-0">
        {IconComponent && <IconComponent size={18} />}
      </div>
      <span className="text-sm font-medium text-gray-700">{element.label}</span>
    </div>
  );
};
