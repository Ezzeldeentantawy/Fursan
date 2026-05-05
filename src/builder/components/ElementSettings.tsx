import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ChevronDown, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Hash, MoveUp, MoveDown, Layers, Eye, Scissors, ArrowDown, ArrowUp, ArrowRight, ArrowLeft, Maximize, Minimize, Image as ImageIcon, Palette, Droplet, Shadow, Sparkles, Link as LinkIcon, Unlink, Plus, Trash2, GripVertical, Bold, Italic, Underline, Strikethrough, CaseUpper, CaseLower, CaseSensitive, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, ExternalLink, Mail, Anchor, FileText, Section, Article, Aside, LayoutDashboard, Navigation, ChevronRight, Settings, PaintBucket, SlidersHorizontal, FlipHorizontal, FlipVertical } from 'lucide-react';
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

// Section definitions for each tab
const TAB_SECTIONS: Record<TabKey, Array<{ name: string; groups: string[] }>> = {
  content: [
    { name: 'Content', groups: ['Content'] },
    { name: 'Link', groups: ['Link'] },
    { name: 'Icon', groups: ['Icon'] },
    { name: 'Element ID & Class', groups: ['Element ID & Class'] },
  ],
  alignment: [
    { name: 'Text Alignment', groups: ['Text Alignment'] },
    { name: 'Layout', groups: ['Layout'] },
    { name: 'Self Alignment', groups: ['Self Alignment'] },
  ],
  design: [
    { name: 'Sizing', groups: ['Sizing'] },
    { name: 'Spacing', groups: ['Spacing'] },
    { name: 'Typography', groups: ['Typography'] },
    { name: 'Background', groups: ['Background'] },
    { name: 'Border', groups: ['Border'] },
    { name: 'Shadow', groups: ['Shadow'] },
    { name: 'Filters', groups: ['Filters'] },
    { name: 'Hover Effects', groups: ['Hover Effects'] },
    { name: 'Effects', groups: ['Effects'] },
  ],
};

// Default expanded sections
const DEFAULT_EXPANDED = new Set([
  'Content', 'Sizing', 'Spacing', 'Typography', 'Background', 'Alignment', 'Layout'
]);

export const ElementSettings: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateProps = useBuilderStore((state) => state.updateProps);
  const activeBp = useBuilderStore((state) => state.activeBp);
  const setActiveBp = useBuilderStore((state) => state.setActiveBp);

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;
  const elementDef = selectedNode ? ELEMENTS_BY_TYPE[selectedNode.type] : null;

  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaBrowserTargetKey, setMediaBrowserTargetKey] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(DEFAULT_EXPANDED);

  if (!selectedId || !selectedNode || !elementDef) {
    return null;
  }

  const controls: ControlDef[] = elementDef.controls || [];

  /**
   * Toggle section expanded state
   */
  const toggleSection = (name: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  /**
   * Check if a responsive prop has overrides for current breakpoint
   */
  const hasOverride = (controlId: string): boolean => {
    if (activeBp === 'md') return false;
    if (!isResponsiveProp(controlId)) return false;
    return selectedNode.props?.responsive?.[activeBp]?.[controlId] !== undefined;
  };

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

  /**
   * Check if current breakpoint has any responsive overrides
   */
  const bpHasOverrides = (bp: Breakpoint): boolean => {
    if (bp === 'md') return false;
    const bpProps = selectedNode.props?.responsive?.[bp];
    return bpProps !== undefined && Object.keys(bpProps).length > 0;
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

  // ============= CONTROL RENDERER HELPERS =============

  const parseNumberValue = (value: any): { num: number | '', unit: string } => {
    if (value === null || value === undefined || value === '') return { num: '', unit: 'px' };
    if (typeof value === 'number') return { num: value, unit: 'px' };
    const match = String(value).match(/^([-\d.]+)(.*)$/);
    if (match) {
      return { num: parseFloat(match[1]) || '', unit: match[2] || 'px' };
    }
    return { num: '', unit: 'px' };
  };

  const formatNumberValue = (num: number | '', unit: string): string => {
    if (num === '' || num === null || num === undefined) return '';
    return `${num}${unit}`;
  };

  // ============= CONTROL RENDERERS =============

  const renderButtonGroup = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = control.options || [];
    const iconMap = control.iconMap || {};

    return (
      <div className="flex gap-1">
        {options.map((opt: any) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const isSelected = value === optValue;

          return (
            <button
              key={optValue}
              onClick={() => onChange(optValue)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-[10px] ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
              title={optLabel}
            >
              {iconMap[optValue] && (
                <span className="w-5 h-5 flex items-center justify-center">
                  {iconMap[optValue]}
                </span>
              )}
              <span className="truncate w-full text-center">{optLabel}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderSpacing = (control: ControlDef, value: any, onChange: (v: any) => void, props: string[]) => {
    const [linked, setLinked] = useState(control.linkedSides !== false);

    // Parse values for each side
    const values: Record<string, { num: number | '', unit: string }> = {};
    props.forEach(prop => {
      const propValue = getPropValue(prop);
      values[prop] = parseNumberValue(propValue);
    });

    const handleChange = (prop: string, num: number | '', unit: string) => {
      if (linked) {
        // Update all sides
        props.forEach(p => {
          setPropValue(p, formatNumberValue(num, unit));
        });
      } else {
        setPropValue(prop, formatNumberValue(num, unit));
      }
    };

    const labels = ['Top', 'Right', 'Bottom', 'Left'];
    const propKeys = ['pt', 'pr', 'pb', 'pl'];

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1 items-center">
          {/* Top */}
          <div className="col-start-2">
            <input
              type="number"
              value={values[propKeys[0]].num}
              onChange={(e) => handleChange(propKeys[0], e.target.value ? parseFloat(e.target.value) : '', values[propKeys[0]].unit)}
              className="w-full px-2 py-1 text-center bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="text-[8px] text-slate-500 text-center mt-0.5">{labels[0]}</div>
          </div>
          {/* Left */}
          <div>
            <input
              type="number"
              value={values[propKeys[3]].num}
              onChange={(e) => handleChange(propKeys[3], e.target.value ? parseFloat(e.target.value) : '', values[propKeys[3]].unit)}
              className="w-full px-2 py-1 text-center bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="text-[8px] text-slate-500 text-center mt-0.5">{labels[3]}</div>
          </div>
          {/* Center gear icon */}
          <div className="flex items-center justify-center">
            <Settings size={14} className="text-slate-600" />
          </div>
          {/* Right */}
          <div>
            <input
              type="number"
              value={values[propKeys[1]].num}
              onChange={(e) => handleChange(propKeys[1], e.target.value ? parseFloat(e.target.value) : '', values[propKeys[1]].unit)}
              className="w-full px-2 py-1 text-center bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="text-[8px] text-slate-500 text-center mt-0.5">{labels[1]}</div>
          </div>
          {/* Bottom */}
          <div className="col-start-2">
            <input
              type="number"
              value={values[propKeys[2]].num}
              onChange={(e) => handleChange(propKeys[2], e.target.value ? parseFloat(e.target.value) : '', values[propKeys[2]].unit)}
              className="w-full px-2 py-1 text-center bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="text-[8px] text-slate-500 text-center mt-0.5">{labels[2]}</div>
          </div>
        </div>
        {/* Unit selectors */}
        <div className="flex gap-1">
          {props.map((prop, i) => (
            <select
              key={prop}
              value={values[prop].unit}
              onChange={(e) => handleChange(prop, values[prop].num, e.target.value)}
              className="flex-1 px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-[9px] text-slate-300 focus:outline-none"
            >
              {['px', '%', 'em', 'rem', 'vw', 'vh'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          ))}
        </div>
        {/* Link all sides */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
            className="w-3 h-3 accent-blue-500"
          />
          <span className="text-[10px] text-slate-400">Link all sides</span>
        </label>
      </div>
    );
  };

  const renderSizing = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const sizingProps = [
      { key: 'width', label: 'Width' },
      { key: 'height', label: 'Height' },
      { key: 'minWidth', label: 'Min Width' },
      { key: 'maxWidth', label: 'Max Width' },
      { key: 'minHeight', label: 'Min Height' },
      { key: 'maxHeight', label: 'Max Height' },
    ];

    return (
      <div className="space-y-1.5">
        {sizingProps.map(({ key, label }) => {
          const propValue = getPropValue(key);
          const parsed = parseNumberValue(propValue);
          return (
            <div key={key} className="grid grid-cols-2 gap-1 items-center">
              <label className="text-[10px] text-slate-400">{label}</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={parsed.num}
                  onChange={(e) => setPropValue(key, formatNumberValue(e.target.value ? parseFloat(e.target.value) : '', parsed.unit))}
                  placeholder="auto"
                  className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={parsed.unit}
                  onChange={(e) => setPropValue(key, formatNumberValue(parsed.num, e.target.value))}
                  className="px-1 py-1 bg-slate-700 border border-slate-600 rounded text-[9px] text-slate-300 focus:outline-none"
                >
                  {['px', '%', 'em', 'rem', 'vw', 'vh', 'auto'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFontWeight = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const weight = value || 400;
    const labels: Record<number, string> = {
      100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Normal', 500: 'Medium',
      600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black'
    };

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={100}
            max={900}
            step={100}
            value={weight}
            onChange={(e) => setPropValue(control.id, parseInt(e.target.value, 10))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-[11px] text-slate-300 w-12 text-right">{weight}</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500 px-1">
          <span>Thin</span>
          <span>Black</span>
        </div>
        <div className="text-center text-[10px] text-blue-400">{labels[weight] || ''}</div>
      </div>
    );
  };

  const renderTextAlign = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'left', icon: <AlignLeft size={16} />, label: 'Left' },
      { value: 'center', icon: <AlignCenter size={16} />, label: 'Center' },
      { value: 'right', icon: <AlignRight size={16} />, label: 'Right' },
      { value: 'justify', icon: <AlignJustify size={16} />, label: 'Justify' },
    ];

    return (
      <div className="flex gap-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setPropValue(control.id, opt.value)}
            className={`flex-1 flex items-center justify-center p-2 rounded-lg border transition-all ${
              value === opt.value
                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
            title={opt.label}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    );
  };

  const renderTextTransform = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'none', label: 'Aa None' },
      { value: 'uppercase', label: 'AA UPPER' },
      { value: 'lowercase', label: 'aa lower' },
      { value: 'capitalize', label: 'Aa Capitalize' },
    ];

    return renderButtonGroup({ ...control, options }, value, onChange);
  };

  const renderTextDecoration = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'none', label: 'T None' },
      { value: 'underline', label: 'T Underline' },
      { value: 'line-through', label: 'T Strikethrough' },
      { value: 'overline', label: 'T Overline' },
    ];

    return renderButtonGroup({ ...control, options }, value, onChange);
  };

  const renderColorPicker = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const colorValue = (value && value !== 'transparent' && /^#[0-9A-Fa-f]{6}$/.test(value)) ? value : '#000000';
    const opacity = getPropValue(control.id + 'Opacity') || 100;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              className="w-8 h-8 border border-slate-700 rounded-lg cursor-pointer"
              style={{ backgroundColor: value || 'transparent' }}
              onClick={() => document.getElementById(`color-input-${control.id}`)?.click()}
            />
            {!value || value === 'transparent' ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">⊘</div>
            ) : null}
          </div>
          <input
            id={`color-input-${control.id}`}
            type="color"
            value={colorValue}
            onChange={(e) => setPropValue(control.id, e.target.value)}
            className="hidden"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setPropValue(control.id, e.target.value || null)}
            placeholder="#000000"
            className="flex-1 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setPropValue(control.id, null)}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            title="Clear color"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={opacity}
            onChange={(e) => setPropValue(control.id + 'Opacity', e.target.value ? parseInt(e.target.value, 10) : 100)}
            min={0}
            max={100}
            className="w-12 px-1 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-[10px] text-slate-500">%</span>
        </div>
      </div>
    );
  };

  const renderBackground = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const [activeBgTab, setActiveBgTab] = useState('color');
    const bgType = getPropValue('bgType') || 'color';

    return (
      <div className="space-y-2">
        {/* Background type tabs */}
        <div className="flex gap-1">
          {['none', 'color', 'gradient', 'image'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveBgTab(tab);
                setPropValue('bgType', tab === 'none' ? null : tab);
              }}
              className={`flex-1 px-2 py-1 text-[10px] rounded transition-all ${
                bgType === tab || (tab === 'none' && !bgType)
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Color mode */}
        {bgType === 'color' && (
          <div className="space-y-1.5">
            {renderColorPicker({ id: 'bgColor', label: 'Background Color' } as ControlDef, getPropValue('bgColor'), (v) => setPropValue('bgColor', v))}
          </div>
        )}

        {/* Gradient mode */}
        {bgType === 'gradient' && (
          <div className="space-y-2">
            <div className="flex gap-1">
              <select
                value={getPropValue('bgGradientType') || 'linear'}
                onChange={(e) => setPropValue('bgGradientType', e.target.value)}
                className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
              <input
                type="number"
                value={getPropValue('bgGradientAngle') || 135}
                onChange={(e) => setPropValue('bgGradientAngle', e.target.value ? parseInt(e.target.value, 10) : 135)}
                className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 self-center">°</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded border border-slate-700" style={{ backgroundColor: getPropValue('bgGradientStop1') || '#3b82f6' }} />
                <input
                  type="text"
                  value={getPropValue('bgGradientStop1') || ''}
                  onChange={(e) => setPropValue('bgGradientStop1', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
                />
                <input
                  type="number"
                  value={getPropValue('bgGradientStop1Pos') || 0}
                  onChange={(e) => setPropValue('bgGradientStop1Pos', e.target.value ? parseInt(e.target.value, 10) : 0)}
                  className="w-12 px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded border border-slate-700" style={{ backgroundColor: getPropValue('bgGradientStop2') || '#8b5cf6' }} />
                <input
                  type="text"
                  value={getPropValue('bgGradientStop2') || ''}
                  onChange={(e) => setPropValue('bgGradientStop2', e.target.value)}
                  placeholder="#8b5cf6"
                  className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
                />
                <input
                  type="number"
                  value={getPropValue('bgGradientStop2Pos') || 100}
                  onChange={(e) => setPropValue('bgGradientStop2Pos', e.target.value ? parseInt(e.target.value, 10) : 100)}
                  className="w-12 px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">%</span>
              </div>
            </div>
          </div>
        )}

        {/* Image mode */}
        {bgType === 'image' && (
          <div className="space-y-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={getPropValue('bgImage') || ''}
                onChange={(e) => setPropValue('bgImage', e.target.value)}
                placeholder="Image URL..."
                className="flex-1 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => openMediaBrowser('bgImage')}
                className="px-2 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] hover:bg-blue-500/30 transition-colors"
              >
                Browse
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <select
                value={getPropValue('bgSize') || 'cover'}
                onChange={(e) => setPropValue('bgSize', e.target.value)}
                className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
              <select
                value={getPropValue('bgPosition') || 'center'}
                onChange={(e) => setPropValue('bgPosition', e.target.value)}
                className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBorder = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const [linkedCorners, setLinkedCorners] = useState(true);

    return (
      <div className="space-y-2">
        {/* Border style */}
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Style</label>
          <select
            value={getPropValue('borderStyle') || 'none'}
            onChange={(e) => setPropValue('borderStyle', e.target.value)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </div>

        {/* Border width */}
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Width</label>
          <input
            type="number"
            value={getPropValue('borderWidth') || ''}
            onChange={(e) => setPropValue('borderWidth', e.target.value ? parseInt(e.target.value, 10) : null)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          />
        </div>

        {/* Border color */}
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Color</label>
          {renderColorPicker({ id: 'borderColor' } as ControlDef, getPropValue('borderColor'), (v) => setPropValue('borderColor', v))}
        </div>

        {/* Border radius */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">Radius</label>
          <div className="grid grid-cols-4 gap-1">
            {['tl', 'tr', 'br', 'bl'].map((corner, i) => (
              <input
                key={corner}
                type="number"
                value={getPropValue(`borderRadius${corner.toUpperCase()}`) || ''}
                onChange={(e) => setPropValue(`borderRadius${corner.toUpperCase()}`, e.target.value ? parseInt(e.target.value, 10) : null)}
                placeholder={['╭', '╮', '╯', '╰'][i]}
                className="w-full px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
              />
            ))}
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={linkedCorners}
              onChange={(e) => setLinkedCorners(e.target.checked)}
              className="w-3 h-3 accent-blue-500"
            />
            <span className="text-[10px] text-slate-400">Link all corners</span>
          </label>
        </div>
      </div>
    );
  };

  const renderShadow = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const shadow = getPropValue('boxShadow') || '';

    return (
      <div className="space-y-2">
        <div className="p-2 bg-slate-800/30 border border-slate-700/50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded border border-slate-700" style={{ boxShadow: shadow || 'none' }} />
            <span className="text-[10px] text-slate-400">Preview</span>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-5 gap-1">
              <input type="number" placeholder="X" className="px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center" />
              <input type="number" placeholder="Y" className="px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center" />
              <input type="number" placeholder="B" className="px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center" />
              <input type="number" placeholder="S" className="px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center" />
              <label className="flex items-center justify-center">
                <input type="checkbox" className="w-3 h-3 accent-blue-500" />
              </label>
            </div>
          </div>
        </div>
        <button className="w-full px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] hover:bg-blue-500/20 transition-colors">
          + Add Shadow
        </button>
      </div>
    );
  };

  const renderOpacity = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const opacity = (value !== undefined && value !== null) ? (value <= 1 ? value * 100 : value) : 100;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setPropValue(control.id, val <= 1 ? val : val);
            }}
            className="flex-1 accent-blue-500"
          />
          <input
            type="number"
            value={opacity}
            onChange={(e) => setPropValue(control.id, e.target.value ? parseInt(e.target.value, 10) : 100)}
            min={0}
            max={100}
            className="w-12 px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
          />
          <span className="text-[10px] text-slate-500">%</span>
        </div>
      </div>
    );
  };

  const renderObjectFit = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
      { value: 'fill', label: 'Fill' },
      { value: 'none', label: 'None' },
      { value: 'scale-down', label: 'Scale Down' },
    ];

    return renderButtonGroup({ ...control, options }, value, onChange);
  };

  const renderFilters = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const filters = [
      { key: 'filterBrightness', label: 'Brightness', default: 100, unit: '%' },
      { key: 'filterContrast', label: 'Contrast', default: 100, unit: '%' },
      { key: 'filterBlur', label: 'Blur', default: 0, unit: 'px' },
      { key: 'filterGrayscale', label: 'Grayscale', default: 0, unit: '%' },
      { key: 'filterSepia', label: 'Sepia', default: 0, unit: '%' },
      { key: 'filterHueRotate', label: 'Hue Rotate', default: 0, unit: 'deg' },
      { key: 'filterSaturate', label: 'Saturate', default: 100, unit: '%' },
    ];

    return (
      <div className="space-y-2">
        {filters.map(f => {
          const val = getPropValue(f.key) ?? f.default;
          return (
            <div key={f.key} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400">{f.label}</label>
                <span className="text-[10px] text-slate-500">{val}{f.unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={f.key === 'filterBlur' ? 20 : f.key === 'filterHueRotate' ? 360 : 100}
                value={val}
                onChange={(e) => setPropValue(f.key, parseInt(e.target.value, 10))}
                className="w-full accent-blue-500"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderHoverEffects = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Scale</label>
          <input
            type="number"
            value={getPropValue('hoverScale') || ''}
            onChange={(e) => setPropValue('hoverScale', e.target.value ? parseFloat(e.target.value) : null)}
            step={0.05}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Move Up</label>
          <input
            type="number"
            value={getPropValue('hoverTranslateY') || ''}
            onChange={(e) => setPropValue('hoverTranslateY', e.target.value ? parseInt(e.target.value, 10) : null)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Duration</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={getPropValue('transitionDuration') || 200}
              onChange={(e) => setPropValue('transitionDuration', e.target.value ? parseInt(e.target.value, 10) : 200)}
              className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">ms</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Easing</label>
          <select
            value={getPropValue('transitionEasing') || 'ease'}
            onChange={(e) => setPropValue('transitionEasing', e.target.value)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          >
            <option value="ease">Ease</option>
            <option value="linear">Linear</option>
            <option value="ease-in">Ease In</option>
            <option value="ease-out">Ease Out</option>
            <option value="ease-in-out">Ease In-Out</option>
          </select>
        </div>
      </div>
    );
  };

  const renderHeadingLevel = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const levels = [
      { value: 'h1', label: 'H1', size: 'text-lg' },
      { value: 'h2', label: 'H2', size: 'text-base' },
      { value: 'h3', label: 'H3', size: 'text-sm' },
      { value: 'h4', label: 'H4', size: 'text-xs' },
      { value: 'h5', label: 'H5', size: 'text-[10px]' },
      { value: 'h6', label: 'H6', size: 'text-[9px]' },
    ];

    return (
      <div className="flex gap-1">
        {levels.map(l => (
          <button
            key={l.value}
            onClick={() => setPropValue(control.id, l.value)}
            className={`flex-1 p-2 rounded-lg border transition-all ${
              value === l.value
                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <span className={l.size}>{l.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderLink = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const linkType = getPropValue('linkType') || 'url';

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Type</label>
          <select
            value={linkType}
            onChange={(e) => setPropValue('linkType', e.target.value)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          >
            <option value="url">URL</option>
            <option value="page">Page</option>
            <option value="anchor">Anchor</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">URL</label>
          <input
            type="text"
            value={getPropValue('linkUrl') || ''}
            onChange={(e) => setPropValue('linkUrl', e.target.value)}
            placeholder="https://..."
            className="col-span-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Open</label>
          <select
            value={getPropValue('linkTarget') || '_self'}
            onChange={(e) => setPropValue('linkTarget', e.target.value)}
            className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
          >
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </select>
        </div>
      </div>
    );
  };

  const renderGap = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    return (
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Row Gap</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={getPropValue('rowGap') || ''}
              onChange={(e) => setPropValue('rowGap', e.target.value ? parseInt(e.target.value, 10) : null)}
              className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
            />
            <select
              value={parseNumberValue(getPropValue('rowGap')).unit}
              onChange={(e) => setPropValue('rowGap', formatNumberValue(parseNumberValue(getPropValue('rowGap')).num, e.target.value))}
              className="px-1 py-1 bg-slate-700 border border-slate-600 rounded text-[9px] text-slate-300"
            >
              {['px', 'em', 'rem', '%'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 items-center">
          <label className="text-[10px] text-slate-400">Column Gap</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={getPropValue('columnGap') || ''}
              onChange={(e) => setPropValue('columnGap', e.target.value ? parseInt(e.target.value, 10) : null)}
              className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
            />
            <select
              value={parseNumberValue(getPropValue('columnGap')).unit}
              onChange={(e) => setPropValue('columnGap', formatNumberValue(parseNumberValue(getPropValue('columnGap')).num, e.target.value))}
              className="px-1 py-1 bg-slate-700 border border-slate-600 rounded text-[9px] text-slate-300"
            >
              {['px', 'em', 'rem', '%'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderLayerOrder = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={-10}
            max={10}
            value={value || 0}
            onChange={(e) => setPropValue(control.id, parseInt(e.target.value, 10))}
            className="flex-1 accent-blue-500"
          />
          <input
            type="number"
            value={value || 0}
            onChange={(e) => setPropValue(control.id, e.target.value ? parseInt(e.target.value, 10) : 0)}
            className="w-12 px-1 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white text-center focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[8px] text-slate-500 px-1">
          <span>Behind</span>
          <span>Front</span>
        </div>
      </div>
    );
  };

  const renderOverflow = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'visible', label: 'Visible' },
      { value: 'hidden', label: 'Hidden' },
      { value: 'scroll', label: 'Scroll' },
      { value: 'auto', label: 'Auto' },
    ];

    return renderButtonGroup({ ...control, options }, value, onChange);
  };

  const renderSpacerHeight = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const heights = [
      { bp: 'md', icon: <Monitor size={14} />, label: 'Desktop' },
      { bp: 'sm', icon: <Tablet size={14} />, label: 'Tablet' },
      { bp: 'base', icon: <Smartphone size={14} />, label: 'Mobile' },
    ];

    return (
      <div className="space-y-1.5">
        {heights.map(h => (
          <div key={h.bp} className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-20">
              {h.icon}
              <span className="text-[10px] text-slate-400">{h.label}</span>
            </div>
            <input
              type="number"
              value={getPropValue(`spacerHeight_${h.bp}`) || ''}
              onChange={(e) => setPropValue(`spacerHeight_${h.bp}`, e.target.value ? parseInt(e.target.value, 10) : null)}
              className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">px</span>
          </div>
        ))}
      </div>
    );
  };

  const renderDividerStyle = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const options = [
      { value: 'solid', label: 'Solid' },
      { value: 'dashed', label: 'Dashed' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'double', label: 'Double' },
    ];

    return renderButtonGroup({ ...control, options }, value, onChange);
  };

  const renderHtmlTag = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    const tags = [
      { value: 'div', label: '<div>', desc: 'Generic container' },
      { value: 'section', label: '<section>', desc: 'Page section' },
      { value: 'article', label: '<article>', desc: 'Standalone content' },
      { value: 'aside', label: '<aside>', desc: 'Sidebar content' },
      { value: 'header', label: '<header>', desc: 'Page/section header' },
      { value: 'footer', label: '<footer>', desc: 'Page/section footer' },
      { value: 'main', label: '<main>', desc: 'Main content area' },
      { value: 'nav', label: '<nav>', desc: 'Navigation' },
    ];

    return (
      <select
        value={value || 'div'}
        onChange={(e) => setPropValue(control.id, e.target.value)}
        className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {tags.map(t => (
          <option key={t.value} value={t.value}>{t.label} → {t.desc}</option>
        ))}
      </select>
    );
  };

  const renderToggle = (control: ControlDef, value: any, onChange: (v: any) => void) => {
    return (
      <div className="flex items-center gap-2">
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
        <span className="text-[10px] text-slate-400">{value ? 'ON' : 'OFF'}</span>
      </div>
    );
  };

  // ============= MAIN CONTROL RENDERER =============

  const renderControl = (control: ControlDef) => {
    const value = getPropValue(control.id);
    const inherited = isInherited(control.id);
    const inheritedValue = getInheritedValue(control.id);
    const isOverridden = hasOverride(control.id);

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

      case 'color':
        return renderColorPicker(control, value, (v) => setPropValue(control.id, v));

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
        return renderToggle(control, value, (v) => setPropValue(control.id, v));

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

      // ============= NEW VISUAL CONTROLS =============

      case 'buttonGroup':
        return renderButtonGroup(control, value, (v) => setPropValue(control.id, v));

      case 'spacing': {
        // Determine if this is padding or margin based on control.id or group
        const isPadding = control.id.includes('padding') || control.group?.toLowerCase().includes('padding');
        const props = isPadding ? ['pt', 'pr', 'pb', 'pl'] : ['mt', 'mr', 'mb', 'ml'];
        return renderSpacing(control, value, (v) => setPropValue(control.id, v), props);
      }

      case 'sizing':
        return renderSizing(control, value, (v) => setPropValue(control.id, v));

      case 'fontWeight':
        return renderFontWeight(control, value, (v) => setPropValue(control.id, v));

      case 'textAlign':
        return renderTextAlign(control, value, (v) => setPropValue(control.id, v));

      case 'textTransform':
        return renderTextTransform(control, value, (v) => setPropValue(control.id, v));

      case 'textDecoration':
        return renderTextDecoration(control, value, (v) => setPropValue(control.id, v));

      case 'colorPicker':
        return renderColorPicker(control, value, (v) => setPropValue(control.id, v));

      case 'background':
        return renderBackground(control, value, (v) => setPropValue(control.id, v));

      case 'border':
        return renderBorder(control, value, (v) => setPropValue(control.id, v));

      case 'shadow':
        return renderShadow(control, value, (v) => setPropValue(control.id, v));

      case 'opacity':
        return renderOpacity(control, value, (v) => setPropValue(control.id, v));

      case 'objectFit':
        return renderObjectFit(control, value, (v) => setPropValue(control.id, v));

      case 'filters':
        return renderFilters(control, value, (v) => setPropValue(control.id, v));

      case 'hoverEffects':
        return renderHoverEffects(control, value, (v) => setPropValue(control.id, v));

      case 'headingLevel':
        return renderHeadingLevel(control, value, (v) => setPropValue(control.id, v));

      case 'link':
        return renderLink(control, value, (v) => setPropValue(control.id, v));

      case 'gap':
        return renderGap(control, value, (v) => setPropValue(control.id, v));

      case 'layerOrder':
        return renderLayerOrder(control, value, (v) => setPropValue(control.id, v));

      case 'overflow':
        return renderOverflow(control, value, (v) => setPropValue(control.id, v));

      case 'spacerHeight':
        return renderSpacerHeight(control, value, (v) => setPropValue(control.id, v));

      case 'dividerStyle':
        return renderDividerStyle(control, value, (v) => setPropValue(control.id, v));

      case 'htmlTag':
        return renderHtmlTag(control, value, (v) => setPropValue(control.id, v));

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

  // ============= CONTROL FIELD WRAPPER =============

  const ControlField: React.FC<{ control: ControlDef; children: React.ReactNode }> = ({ control, children }) => {
    const inherited = isInherited(control.id);
    const isOverridden = hasOverride(control.id);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {control.label}
          </label>
          {inherited && (
            <span className="text-[9px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">↑ Desktop</span>
          )}
          {isOverridden && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <button
                onClick={() => setPropValue(control.id, null)}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
                title="Reset to inherit"
              >
                <X size={12} />
              </button>
            </>
          )}
          {control.responsive && (
            <span className="text-[9px] font-bold text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded ml-auto">
              RSP
            </span>
          )}
        </div>
        {children}
      </div>
    );
  };

  // ============= TAB AND SECTION RENDERING =============

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

  const renderSection = (sectionName: string, sectionGroups: string[]) => {
    const isExpanded = expandedSections.has(sectionName);
    const sectionControls = controls.filter(c => sectionGroups.includes(c.group || 'General'));
    const controlCount = sectionControls.length;

    // Skip empty sections
    if (controlCount === 0) return null;

    return (
      <div key={sectionName} className="border-b border-slate-700/50 last:border-b-0">
        <button
          onClick={() => toggleSection(sectionName)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform duration-150 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sectionName} ({controlCount})
            </span>
          </div>
        </button>
        <div
          className={`overflow-hidden transition-all duration-150 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-3 pb-3 space-y-3">
            {Object.entries(groupControls(sectionControls)).map(([groupName, groupControls]) => (
              <div key={groupName}>
                {groupName !== sectionName && (
                  <h5 className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {groupName}
                  </h5>
                )}
                <div className="space-y-3">
                  {groupControls.map((control) => (
                    <ControlField key={control.id} control={control}>
                      {renderControl(control)}
                    </ControlField>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Breakpoint Switcher */}
      <div className="px-3 py-2 bg-slate-800/30 border-b border-slate-700/50">
        <div className="flex items-center gap-1">
          {([
            { bp: 'md' as Breakpoint, icon: <Monitor size={14} />, label: 'Desktop' },
            { bp: 'sm' as Breakpoint, icon: <Tablet size={14} />, label: 'Tablet' },
            { bp: 'base' as Breakpoint, icon: <Smartphone size={14} />, label: 'Mobile' },
          ]).map(({ bp, icon, label }) => (
            <button
              key={bp}
              onClick={() => setActiveBp(bp)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                activeBp === bp
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {icon}
              <span>{label}</span>
              {bpHasOverrides(bp) && bp !== 'md' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          ))}
        </div>
      </div>

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
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {isSpacerAlignment ? (
          <div className="text-center py-8">
            <div className="text-slate-500 text-xs mb-2">ℹ️</div>
            <p className="text-slate-400 text-xs">Spacer has no alignment settings</p>
          </div>
        ) : (
          TAB_SECTIONS[activeTab].map(section =>
            renderSection(section.name, section.groups)
          )
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
