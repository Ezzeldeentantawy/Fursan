import React, { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { ELEMENTS_BY_TYPE } from '../DynamicPages';
import { findNode } from '../utils/treeUtils';
import { RichTextEditor } from './RichTextEditor';

export const PropsPanel: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateProps = useBuilderStore((state) => state.updateProps);

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const elementDef = selectedNode ? ELEMENTS_BY_TYPE[selectedNode.type] : null;

  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});

  if (!selectedId || !selectedNode || !elementDef) {
    return (
      <div className="w-[300px] bg-gray-50 border-l border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        </div>
        <div className="p-8 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-sm">No element selected</p>
          <p className="text-xs mt-1">Click on an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateProps(selectedId, { [key]: value });
  };

  const renderControl = (control: any) => {
    const value = selectedNode.props[control.key] ?? '';

    switch (control.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(control.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(control.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(control.key, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handleChange(control.key, e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(control.key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'select': {
        const options = control.options || [];
        const isObjectOptions = options.length > 0 && typeof options[0] === 'object';
        return (
          <select
            value={value}
            onChange={(e) => handleChange(control.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {isObjectOptions
              ? options.map((option: { label: string; value: string | number }) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))
              : options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
            }
          </select>
        );
      }

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => handleChange(control.key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'richtext':
        return (
          <RichTextEditor
            value={value}
            onChange={(html) => handleChange(control.key, html)}
          />
        );

      case 'image-url':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(control.key, e.target.value)}
              placeholder="Enter image URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {value && (
              <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-auto max-h-[150px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown control type: {control.type}</div>;
    }
  };

  return (
    <div className="w-[300px] bg-gray-50 border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        <p className="text-xs text-gray-500 mt-1">
          {elementDef.label} ({selectedNode.type})
        </p>
      </div>

      <div className="p-4 space-y-4">
        {elementDef.controls.map((control: any) => (
          <div key={control.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {control.label}
            </label>
            {renderControl(control)}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">ID: {selectedNode.id}</p>
      </div>
    </div>
  );
};
