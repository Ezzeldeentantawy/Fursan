import React, { useState } from 'react';
import { ELEMENTS_BY_CATEGORY, ELEMENTS } from '../DynamicPages';
import { DraggableWidget } from './DraggableWidget';

const categoryLabels: Record<string, string> = {
  basic: 'Basic',
  layout: 'Layout',
  media: 'Media',
  advanced: 'Advanced',
};

const categoryOrder = ['basic', 'layout', 'media', 'advanced'];

export const WidgetPanel: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    layout: true,
    media: true,
    advanced: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-[280px] bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Widgets</h2>
        <p className="text-xs text-gray-500 mt-1">Drag elements to the canvas</p>
      </div>

      <div className="p-3">
        {categoryOrder.map((category) => {
          const elements = ELEMENTS_BY_CATEGORY[category];
          if (!elements || elements.length === 0) return null;

          const isExpanded = expandedCategories[category];

          return (
            <div key={category} className="mb-4">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span>{categoryLabels[category] || category}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2 pl-1">
                  {elements.map((element) => (
                    <DraggableWidget key={element.type} element={element} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
