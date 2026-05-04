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
        flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl
        cursor-grab hover:border-slate-600 transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      style={style}
    >
      <div className="w-8 h-8 bg-slate-700 text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
        {IconComponent && <IconComponent size={18} />}
      </div>
      <span className="text-xs font-bold text-slate-300">{element.label}</span>
    </div>
  );
};
