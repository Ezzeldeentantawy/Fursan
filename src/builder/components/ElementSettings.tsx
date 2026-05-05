import React, { useState } from 'react';
import { useBuilderStore, Breakpoint } from '../store/builderStore';
import { ELEMENTS_BY_TYPE, ControlDef } from '../DynamicPages';
import { findNode } from '../utils/treeUtils';
import { RichTextEditor } from './RichTextEditor';
import { MediaBrowser } from './MediaBrowser';

type TabKey = 'content' | 'alignment' | 'design';

// Properties that are ALWAYS GLOBAL (top-level props)
const GLOBAL_PROPS = new Set([
  'customClass', 'customId',
  'borderRadius', 'borderWidth', 'borderColor', 'borderStyle',
  'boxShadow',
  'bgColor', 'bgImage', 'bgSize', 'bgPosition', 'bgRepeat', 'bgOverlayColor', 'bgOverlayOpacity',
  'zIndex',
  'opacity',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'textDecoration',
  'textTransform',
  'letterSpacing',
  'color',
  'textShadow',
  'src',
  'alt', 'title', 'caption',
  'linkUrl', 'linkTarget', 'linkType',
  'tag', 'level',
  'text',
  'iconName', 'iconPosition', 'iconSize', 'iconGap', 'iconColor', 'iconHoverColor',
  'objectFit', 'objectPosition',
  'overflow',
  'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent',
  'rowGap', 'columnGap',
  'dividerStyle', 'dividerColor',
  'lazyLoad',
  'disabled',
  'fullWidth',
  'dropCap',
  'showMiddleContent', 'middleType', 'middleText', 'middleIconName',
  'middleContentColor', 'middleContentSize', 'middleContentBg', 'middleContentPadding',
  'hoverColor', 'hoverBgColor', 'hoverBorderColor', 'hoverBoxShadow', 'hoverScale', 'hoverTranslateY',
  'transitionDuration', 'transitionEasing',
  'filterBlur', 'filterBrightness', 'filterContrast', 'filterGrayscale', 'filterSepia', 'filterHueRotate', 'filterSaturate',
  'hoverFilterBlur', 'hoverFilterBrightness', 'hoverFilterGrayscale',
]);

// Properties that are ALWAYS RESPONSIVE (inside responsive.md/sm/base)
const RESPONSIVE_PROPS = new Set([
  'width', 'minWidth', 'maxWidth',
  'height', 'minHeight', 'maxHeight',
  'pt', 'pr', 'pb', 'pl',
  'mt', 'mr', 'mb', 'ml',
  'fontSize',
  'lineHeight',
  'textAlign',
  'display',
  'columns', 'columnGap',
  'spacerHeight',
  'dividerWidth', 'dividerThickness',
  'justifySelf', 'alignSelf',
]);

function isResponsiveProp(key: string): boolean {
  return RESPONSIVE_PROPS.has(key);
}

export const ElementSettings: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateProps = useBuilderStore((state) => state.updateProps);
  const activeBp = useBuilderStore((state) => state.activeBp);

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const elementDef = selectedNode ? ELEMENTS_BY_TYPE[selectedNode.type] : null;

  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaBrowserTargetKey, setMediaBrowserTargetKey] = useState<string>('');

  if (!selectedId || !selectedNode || !elementDef) {
    return null;
  }

  const controls: ControlDef[] = elementDef.controls || [];

  /**
   * Read a property value respecting responsive/global classification
   */
  const getPropValue = (controlId: string): any => {
    // Special handling for spacer height per-breakpoint controls
    if (controlId.startsWith('spacerHeight_')) {
      const bp = controlId.replace('spacerHeight_', '') as Breakpoint;
      return selectedNode.props?.responsive?.[bp]?.spacerHeight ?? null;
    }

    if (isResponsiveProp(controlId)) {
      // Responsive prop: read from responsive[activeBp][key]
      const bpValue = selectedNode.props?.responsive?.[activeBp]?.[controlId];
      if (bpValue !== undefined && bpValue !== null) {
        return bpValue;
      }
      // Inherit from md
      if (activeBp !== 'md') {
        return selectedNode.props?.responsive?.md?.[controlId] ?? null;
      }
      return null;
    }

    // Global prop: read from top-level props
    return selectedNode.props?.[controlId] ?? null;
  };

  /**
   * Check if a responsive value is inherited from md
   */
  const isInherited = (controlId: string): boolean => {
    if (activeBp === 'md') return false;
    if (!isResponsiveProp(controlId)) return false;

    const bpValue = selectedNode.props?.responsive?.[activeBp]?.[controlId];
    if (bpValue !== undefined && bpValue !== null) return false;

    const mdValue = selectedNode.props?.responsive?.md?.[controlId];
    return mdValue !== undefined && mdValue !== null;
  };

  /**
   * Get the inherited value from md for display as placeholder
   */
  const getInheritedValue = (controlId: string): any => {
    if (activeBp === 'md') return null;
    return selectedNode.props?.responsive?.md?.[controlId] ?? null;
  };

  /**
   * Update a property value respecting responsive/global classification
   */
  const setPropValue = (controlId: string, value: any) => {
    // Special handling for spacer height per-breakpoint controls
    if (controlId.startsWith('spacerHeight_')) {
      const bp = controlId.replace('spacerHeight_', '') as Breakpoint;
      const responsive = { ...selectedNode.props.responsive };
      responsive[bp] = { ...responsive[bp], spacerHeight: value || null };
      updateProps(selectedId, { responsive });
      return;
    }

    if (isResponsiveProp(controlId)) {
      // Responsive prop: write to responsive[activeBp][key]
      const responsive = { ...selectedNode.props.responsive };
      const bpProps = { ...responsive[activeBp] };
      bpProps[controlId] = value || null; // null = reset to inherit
      responsive[activeBp] = bpProps;
      updateProps(selectedId, { responsive });
    } else {
      // Global prop: write to top-level props
      updateProps(selectedId, { [controlId]: value });
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaBrowserTargetKey) {
      setPropValue(mediaBrowserTargetKey, url);
    }
  };

  const openMediaBrowser = (controlKey: string) => {
    setMediaBrowserTargetKey(controlKey);
    setShowMediaBrowser(true);
  };

  const renderControl = (control: ControlDef) => {
    const value = getPropValue(control.id);
    const inherited = isInherited(control.id);
    const inheritedValue = getInheritedValue(control.id);

    const inputBaseClass = `w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      inherited ? 'opacity-60 italic' : ''
    }`;

    switch (control.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => setPropValue(control.id, e.target.value || null)}
            className={inputBaseClass}
            placeholder={control.placeholder || (inherited ? `Inherited: ${inheritedValue}` : '')}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => setPropValue(control.id, e.target.value ? parseFloat(e.target.value) : null)}
            min={control.min}
            max={control.max}
            step={control.step}
            className={inputBaseClass}
            placeholder={inherited ? `Inherited: ${inheritedValue}` : ''}
          />
        );

      case 'color': {
        const colorInputValue = (value && value !== 'transparent' && /^#[0-9A-Fa-f]{6}$/.test(value)) ? value : '#000000';
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorInputValue}
              onChange={(e) => setPropValue(control.id, e.target.value)}
              className="w-8 h-8 border border-slate-700 rounded-lg cursor-pointer bg-slate-800/50"
            />
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => setPropValue(control.id, e.target.value || null)}
              placeholder={inherited ? `Inherited: ${inheritedValue}` : 'e.g., #ff0000 or transparent'}
              className={`flex-1 ${inputBaseClass}`}
            />
          </div>
        );
      }

      case 'select': {
        const options = control.options || [];
        const isObjectOptions = options.length > 0 && typeof options[0] === 'object';
        return (
          <select
            value={value ?? ''}
            onChange={(e) => setPropValue(control.id, e.target.value || null)}
            className={inputBaseClass}
          >
            <option value="">Default</option>
            {isObjectOptions
              ? (options as Array<{ label: string; value: string | number }>).map((option) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))
              : (options as string[]).map((option) => (
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
            onClick={() => setPropValue(control.id, !value)}
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

      case 'slider':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={control.min ?? 0}
                max={control.max ?? 100}
                step={control.step ?? 1}
                value={value ?? ''}
                onChange={(e) => setPropValue(control.id, e.target.value ? parseInt(e.target.value, 10) : null)}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs text-slate-400 w-10 text-right">{value !== null && value !== undefined ? `${value}%` : '—'}</span>
            </div>
          </div>
        );

      case 'richtext':
        return (
          <RichTextEditor
            value={value ?? ''}
            onChange={(html) => setPropValue(control.id, html)}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={value ?? ''}
                onChange={(e) => setPropValue(control.id, e.target.value || null)}
                placeholder="Enter image URL..."
                className={`flex-1 ${inputBaseClass}`}
              />
              <button
                type="button"
                onClick={() => openMediaBrowser(control.id)}
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

      case 'font':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => setPropValue(control.id, e.target.value || null)}
            className={inputBaseClass}
            placeholder="e.g., Inter, Arial, sans-serif"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => setPropValue(control.id, e.target.value || null)}
            className={inputBaseClass}
            placeholder={control.placeholder || ''}
          />
        );
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'content', label: 'Content' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'design', label: 'Design' },
  ];

  const getControlsForTab = (tab: TabKey) => {
    return controls.filter((control) => control.tab === tab);
  };

  // Group controls by their group property
  const groupControls = (tabControls: ControlDef[]) => {
    const groups: Record<string, ControlDef[]> = {};
    tabControls.forEach((control) => {
      const group = control.group || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(control);
    });
    return groups;
  };

  const isSpacerAlignment = selectedNode.type === 'spacer' && activeTab === 'alignment';

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

      {/* Active Breakpoint Indicator */}
      <div className="px-3 py-1.5 bg-slate-800/30 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Editing:</span>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
            {activeBp === 'md' ? 'Desktop' : activeBp === 'sm' ? 'Tablet' : 'Mobile'}
          </span>
          {activeBp !== 'md' && (
            <span className="text-[10px] text-slate-500">— values inherit from Desktop if not set</span>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-3 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {isSpacerAlignment ? (
          <div className="text-center py-8">
            <div className="text-slate-500 text-xs mb-2">ℹ️</div>
            <p className="text-slate-400 text-xs">Spacer has no alignment settings</p>
          </div>
        ) : (
          Object.entries(groupControls(getControlsForTab(activeTab))).map(([groupName, groupControls]) => (
            <div key={groupName}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 pb-1 border-b border-slate-700/50">
                {groupName}
              </h4>
              <div className="space-y-3">
                {groupControls.map((control) => (
                  <div key={control.id}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {control.label}
                      </label>
                      {control.responsive && (
                        <span className="text-[9px] font-bold text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          RSP
                        </span>
                      )}
                      {isInherited(control.id) && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          inherited
                        </span>
                      )}
                      {control.unit && (
                        <span className="text-[9px] text-slate-500">({control.unit})</span>
                      )}
                    </div>
                    {renderControl(control)}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {getControlsForTab(activeTab).length === 0 && !isSpacerAlignment && (
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
