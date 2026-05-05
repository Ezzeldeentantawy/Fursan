import React, { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { ELEMENTS_BY_TYPE } from '../DynamicPages';
import { findNode } from '../utils/treeUtils';
import { RichTextEditor } from './RichTextEditor';
import { MediaBrowser } from './MediaBrowser';

type TabKey = 'content' | 'alignment' | 'design';

// Controls categorized by tab
const CONTENT_CONTROLS = ['text', 'html', 'content', 'src', 'alt', 'caption', 'url', 'href', 'label', 'linkUrl', 'tag', 'level', 'size', 'icon', 'iconPos', 'iconSize', 'iconColor', 'thickness', 'style', 'height', 'editMode'];
const ALIGNMENT_CONTROLS = ['display', 'flexDir', 'flexDirection', 'flexWrap', 'justify', 'justifyContent', 'align', 'items', 'alignItems', 'gap', 'padding', 'pt', 'pr', 'pb', 'pl', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'mt', 'mr', 'mb', 'ml', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'direction', 'textAlign', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'bgSize'];
const DESIGN_CONTROLS = ['color', 'bgColor', 'textColor', 'bgImage', 'bgGradient', 'bgGradientType', 'bgGradientDirection', 'bgGradientColor1', 'bgGradientColor2', 'borderRadius', 'borderWidth', 'borderColor', 'borderStyle', 'hoverBg', 'hoverColor', 'hoverBorderColor', 'hoverBorderWidth', 'hoverBorderStyle', 'hoverScale', 'fontSize', 'fontWeight', 'textTransform', 'textDecoration', 'letterSpacing', 'wordSpacing', 'lineHeight', 'opacity', 'boxShadow', 'zIndex', 'customClass', 'customId', 'responsive', 'minHeight'];

export const ElementSettings: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateProps = useBuilderStore((state) => state.updateProps);

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const elementDef = selectedNode ? ELEMENTS_BY_TYPE[selectedNode.type] : null;

  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaBrowserTargetKey, setMediaBrowserTargetKey] = useState<string>('');

  if (!selectedId || !selectedNode || !elementDef) {
    return null;
  }

  const handleChange = (key: string, value: any) => {
    updateProps(selectedId, { [key]: value });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaBrowserTargetKey) {
      handleChange(mediaBrowserTargetKey, url);
    }
  };

  const openMediaBrowser = (controlKey: string) => {
    setMediaBrowserTargetKey(controlKey);
    setShowMediaBrowser(true);
  };

  const isInTab = (controlKey: string, tab: TabKey): boolean => {
    const tabControls = {
      content: CONTENT_CONTROLS,
      alignment: ALIGNMENT_CONTROLS,
      design: DESIGN_CONTROLS,
    };
    return tabControls[tab].includes(controlKey);
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
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={control.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(control.key, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(control.key, parseFloat(e.target.value) || 0)}
            min={control.min}
            max={control.max}
            step={control.step}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'color':
        const colorInputValue = (value && value !== 'transparent' && /^#[0-9A-Fa-f]{6}$/.test(value)) ? value : '#000000';
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorInputValue}
              onChange={(e) => handleChange(control.key, e.target.value)}
              className="w-8 h-8 border border-slate-700 rounded-lg cursor-pointer bg-slate-800/50"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(control.key, e.target.value)}
              placeholder="e.g., #ff0000 or transparent"
              className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              value ? 'bg-blue-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'richtext':
        if (selectedNode?.type === 'paragraph' && selectedNode?.props?.editMode === 'code' && control.key === 'content') {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(control.key, e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="<p>Enter HTML here...</p>"
            />
          );
        }
        return (
          <RichTextEditor
            value={value}
            onChange={(html) => handleChange(control.key, html)}
          />
        );

      case 'image-url':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(control.key, e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => openMediaBrowser(control.key)}
                className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                title="Browse Media Library"
              >
                Browse
              </button>
            </div>
            {value && (
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-auto max-h-[100px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-slate-500 text-xs">Unknown control type: {control.type}</div>;
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'content', label: 'Content' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'design', label: 'Design' },
  ];

  const getControlsForTab = (tab: TabKey) => {
    return elementDef.controls.filter((control: any) => {
      // Skip separators and responsive controls in tabs
      if (control.type === 'separator') return false;
      if (control.responsiveOnly) return false;
      if (control.key === 'responsive') return false;
      return isInTab(control.key, tab);
    });
  };

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {getControlsForTab(activeTab).map((control: any) => (
          <div key={control.key}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              {control.label}
            </label>
            {renderControl(control)}
          </div>
        ))}

        {getControlsForTab(activeTab).length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No {activeTab} options for this element.
          </div>
        )}
      </div>

      {/* Element ID footer */}
      <div className="p-3 border-t border-slate-700">
        <p className="text-[10px] text-slate-600 truncate">ID: {selectedNode.id}</p>
      </div>

      {/* Media Browser Modal */}
      <MediaBrowser
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
};
