import React, { useState } from 'react';
import { ELEMENTS_BY_CATEGORY, ELEMENTS } from '../DynamicPages';
import { DraggableWidget } from './DraggableWidget';
import { ElementSettings } from './ElementSettings';
import { useBuilderStore } from '../store/builderStore';
import { findNode } from '../utils/treeUtils';
import { ELEMENTS_BY_TYPE } from '../DynamicPages';
import { X } from 'lucide-react';

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

  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const selectElement = useBuilderStore((state) => state.selectElement);

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const elementDef = selectedNode ? ELEMENTS_BY_TYPE[selectedNode.type] : null;
  const hasSelectedElement = !!(selectedId && selectedNode && elementDef);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDeselect = () => {
    selectElement(null);
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 h-full flex flex-col overflow-hidden">
      {/* Widgets List - shown when NO element is selected */}
      {!hasSelectedElement && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Widgets</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Drag elements to the canvas</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {categoryOrder.map((category) => {
              const elements = ELEMENTS_BY_CATEGORY[category];
              if (!elements || elements.length === 0) return null;

              const isExpanded = expandedCategories[category];

              return (
                <div key={category} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-800 rounded-md transition-colors"
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
      )}

      {/* Element Settings - shown when element IS selected */}
      {hasSelectedElement && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Selected element header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              {elementDef.icon && <elementDef.icon size={14} className="text-blue-400" />}
              <span className="text-xs font-bold text-white">{elementDef.label}</span>
            </div>
            <button
              onClick={handleDeselect}
              className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Back to widgets"
            >
              <X size={14} />
            </button>
          </div>

          {/* Tabbed settings - takes remaining height */}
          <div className="flex-1 overflow-y-auto">
            <ElementSettings />
          </div>
        </div>
      )}
    </div>
  );
};
