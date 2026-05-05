import React, { useRef, useState, useEffect } from 'react';
import { Type, AlignLeft, MousePointerClick, Minus, MoveVertical, Box, Image, Smartphone, Tablet, Monitor } from 'lucide-react';
import { propMap } from './registry/componentRegistry';

// ============= HELPER FUNCTIONS =============

/**
 * Clean URL strings that may have JSON escape sequences
 */
export const cleanUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url || '';
  return url.replace(/\\\//g, '/');
};

/**
 * Get alignment class for text elements
 */
export const getTextAlignmentClass = (alignment: string): string => {
  if (alignment === 'center') return 'text-center';
  if (alignment === 'right') return 'text-right';
  return 'text-left';
};

// Keep old name as alias for backward compatibility
export const getAlignClass = getTextAlignmentClass;

// ============= BREAKPOINT CONFIGURATION =============

export type Breakpoint = 'base' | 'sm' | 'md';

export interface BreakpointConfig {
  key: Breakpoint;
  label: string;
  prefix: string;
  icon: React.FC<{ size?: number; className?: string }>;
  width: string;
  minWidth: number;
  maxWidth: number | null;
}

export const breakpoints: BreakpointConfig[] = [
  {
    key: 'base',
    label: 'Mobile',
    prefix: '',
    icon: Smartphone,
    width: '375px',
    minWidth: 0,
    maxWidth: 767
  },
  {
    key: 'sm',
    label: 'Tablet',
    prefix: 'sm:',
    icon: Tablet,
    width: '768px',
    minWidth: 768,
    maxWidth: 1024
  },
  {
    key: 'md',
    label: 'Desktop',
    prefix: 'md:',
    icon: Monitor,
    width: '100%',
    minWidth: 1024,
    maxWidth: null
  }
];

// ============= DEFAULT PROPS & FIELD DEFINITIONS =============

export const defaultResponsiveProps = {
  customClass: null,
  customId: null,
  responsive: {
    md: {},
    sm: {},
    base: {},
  },
};

export const commonAdvancedFields = [
  {
    key: 'sep_sizing',
    label: 'Layering & Depth',
    type: 'separator'
  },
  {
    key: 'zIndex',
    label: 'Z-Index Layer',
    type: 'number',
    min: -100,
    max: 9999,
    step: 1
  },
  {
    key: 'boxShadow',
    label: 'Box Shadow',
    type: 'text',
    placeholder: '0 4px 12px rgba(0,0,0,0.1)'
  },
  {
    key: 'sep_common',
    label: 'Advanced Identity',
    type: 'separator'
  },
  {
    key: 'customClass',
    label: 'Custom CSS Class',
    type: 'text',
    placeholder: 'my-element-class'
  },
  {
    key: 'customId',
    label: 'Custom HTML ID',
    type: 'text',
    placeholder: 'my-element-id'
  },
  {
    key: 'responsive',
    label: 'Responsive Styles',
    type: 'responsive'
  }
];

export const defaultTypographyProps = {
  fontSize: '',
  fontWeight: '',
  textTransform: 'none',
  textDecoration: 'none',
  letterSpacing: '',
  wordSpacing: '',
  lineHeight: ''
};

export const createTypographyFields = (prefix = '') => [
  {
    key: prefix + 'fontSize',
    label: 'Font Size',
    type: 'text',
    placeholder: '24px, 1.5rem'
  },
  {
    key: prefix + 'fontWeight',
    label: 'Font Weight',
    type: 'select',
    options: [
      { label: 'Default', value: '' },
      { label: '100', value: '100' },
      { label: '200', value: '200' },
      { label: '300', value: '300' },
      { label: '400', value: '400' },
      { label: '500', value: '500' },
      { label: '600', value: '600' },
      { label: '700', value: '700' },
      { label: '800', value: '800' },
      { label: '900', value: '900' }
    ]
  },
  {
    key: prefix + 'textTransform',
    label: 'Text Transform',
    type: 'select',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Uppercase', value: 'uppercase' },
      { label: 'Lowercase', value: 'lowercase' },
      { label: 'Capitalize', value: 'capitalize' }
    ]
  },
  {
    key: prefix + 'textDecoration',
    label: 'Text Decoration',
    type: 'select',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Underline', value: 'underline' },
      { label: 'Line Through', value: 'line-through' },
      { label: 'Overline', value: 'overline' }
    ]
  },
  {
    key: prefix + 'letterSpacing',
    label: 'Letter Spacing',
    type: 'text',
    placeholder: '0.1em, 2px'
  },
  {
    key: prefix + 'wordSpacing',
    label: 'Word Spacing',
    type: 'text',
    placeholder: '0.2em, 5px'
  },
  {
    key: prefix + 'lineHeight',
    label: 'Line Height',
    type: 'text',
    placeholder: '1.5, 24px'
  }
];

// ============= ELEMENT DEFINITIONS =============

// Control type for settings panel
export interface ControlDef {
  id: string;
  label: string;
  tab: 'content' | 'alignment' | 'design';
  group?: string;
  type: 'text' | 'richtext' | 'select' | 'color' | 'slider' | 'toggle' | 'number' | 'spacing' | 'border' | 'shadow' | 'font' | 'image' | 'buttonGroup' | 'background' | 'fontWeight' | 'opacity' | 'layerOrder' | 'overflow' | 'objectFit' | 'dividerStyle' | 'htmlTag' | 'colorPicker' | 'imageFit' | 'gap' | 'spacerHeight' | 'headingLevel' | 'link' | 'iconPicker' | 'textTransform' | 'textDecoration' | 'hoverEffects' | 'filters' | 'sizing' | 'textAlign';
  unit?: string;
  responsive?: boolean;
  default?: any;
  options?: Array<string | { label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  linkedSides?: boolean;    // For spacing controls
  multiLayer?: boolean;     // For shadow controls
  tabs?: string[];          // For background tabs
  iconMap?: Record<string, string>; // For buttonGroup icon mapping
}

export const elementDefinitions: Record<string, any> = {
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: Type,
    category: 'basic',
    defaults: {
      text: 'Your Heading',
      level: 'h2',
      tag: 'h2',
      linkUrl: null,
      linkTarget: '_self',
      fontFamily: null,
      fontWeight: '700',
      fontStyle: 'normal',
      textDecoration: 'none',
      textTransform: 'none',
      letterSpacing: null,
      color: '#000000',
      textShadow: null,
      bgColor: null,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      customClass: null,
      customId: null,
      responsive: {
        md: { fontSize: '32px', lineHeight: '1.3', textAlign: 'left', pt: null, pr: null, pb: null, pl: null, mt: null, mr: null, mb: null, ml: null },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'text', label: 'Text', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Your Heading' },
      { id: 'level', label: 'Heading Level', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'h2', options: [{ label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' }, { label: 'H5', value: 'h5' }, { label: 'H6', value: 'h6' }] },
      { id: 'linkUrl', label: 'Link URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null, placeholder: 'https://...' },
      { id: 'linkTarget', label: 'Link Target', tab: 'content', group: 'Content', type: 'select', responsive: false, default: '_self', options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }] },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'textAlign', label: 'Text Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }, { label: 'Justify', value: 'justify' }] },
      // Design tab - Typography
      { id: 'fontFamily', label: 'Font Family', tab: 'design', group: 'Typography', type: 'font', responsive: false, default: null },
      { id: 'fontSize', label: 'Font Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: '32px' },
      { id: 'fontWeight', label: 'Font Weight', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: '700', options: [{ label: '100', value: '100' }, { label: '200', value: '200' }, { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }] },
      { id: 'fontStyle', label: 'Font Style', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'normal', options: [{ label: 'Normal', value: 'normal' }, { label: 'Italic', value: 'italic' }] },
      { id: 'lineHeight', label: 'Line Height', tab: 'design', group: 'Typography', type: 'text', responsive: true, default: '1.3' },
      { id: 'letterSpacing', label: 'Letter Spacing', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'textTransform', label: 'Text Transform', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }] },
      { id: 'textDecoration', label: 'Text Decoration', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Underline', value: 'underline' }, { label: 'Line Through', value: 'line-through' }, { label: 'Overline', value: 'overline' }] },
      { id: 'color', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'textShadow', label: 'Text Shadow', tab: 'design', group: 'Typography', type: 'text', responsive: false, default: null, placeholder: '2px 2px 4px rgba(0,0,0,0.3)' },
      // Design tab - Background
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      // Design tab - Spacing
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Border
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }] },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      // Design tab - Effects
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null, placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return HeadingComponent; },
  },
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    icon: AlignLeft,
    category: 'basic',
    defaults: {
      text: 'Your paragraph text goes here. You can edit this content to add your own text.',
      linkUrl: null,
      linkTarget: '_self',
      fontFamily: null,
      fontWeight: '400',
      fontStyle: 'normal',
      textDecoration: 'none',
      textTransform: 'none',
      letterSpacing: null,
      color: '#000000',
      textShadow: null,
      dropCap: false,
      bgColor: null,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      customClass: null,
      customId: null,
      responsive: {
        md: { fontSize: '16px', lineHeight: '1.6', textAlign: 'left', columns: '1', columnGap: null, maxWidth: null, pt: null, pr: null, pb: null, pl: null, mt: null, mr: null, mb: null, ml: null },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'text', label: 'Content', tab: 'content', group: 'Content', type: 'richtext', responsive: false, default: 'Your paragraph text goes here. You can edit this content to add your own text.' },
      { id: 'dropCap', label: 'Drop Cap', tab: 'content', group: 'Content', type: 'toggle', responsive: false, default: false },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'textAlign', label: 'Text Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }, { label: 'Justify', value: 'justify' }] },
      { id: 'columns', label: 'Columns', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: '1', options: [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }] },
      { id: 'columnGap', label: 'Column Gap', tab: 'alignment', group: 'Alignment', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Typography
      { id: 'fontFamily', label: 'Font Family', tab: 'design', group: 'Typography', type: 'font', responsive: false, default: null },
      { id: 'fontSize', label: 'Font Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: '16px' },
      { id: 'fontWeight', label: 'Font Weight', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: '400', options: [{ label: '100', value: '100' }, { label: '200', value: '200' }, { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }] },
      { id: 'fontStyle', label: 'Font Style', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'normal', options: [{ label: 'Normal', value: 'normal' }, { label: 'Italic', value: 'italic' }] },
      { id: 'lineHeight', label: 'Line Height', tab: 'design', group: 'Typography', type: 'text', responsive: true, default: '1.6' },
      { id: 'letterSpacing', label: 'Letter Spacing', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'textTransform', label: 'Text Transform', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }] },
      { id: 'textDecoration', label: 'Text Decoration', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Underline', value: 'underline' }, { label: 'Line Through', value: 'line-through' }, { label: 'Overline', value: 'overline' }] },
      { id: 'color', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'textShadow', label: 'Text Shadow', tab: 'design', group: 'Typography', type: 'text', responsive: false, default: null, placeholder: '2px 2px 4px rgba(0,0,0,0.3)' },
      // Design tab - Background
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      // Design tab - Spacing
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'maxWidth', label: 'Max Width', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Border
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }] },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      // Design tab - Effects
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null, placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return TextComponent; },
  },
  button: {
    type: 'button',
    label: 'Button',
    icon: MousePointerClick,
    category: 'basic',
    defaults: {
      text: 'Click Me',
      linkUrl: '#',
      linkTarget: '_self',
      linkType: 'url',
      iconName: null,
      iconPosition: 'left',
      iconSize: '16px',
      iconGap: '8px',
      disabled: false,
      fontFamily: null,
      fontWeight: '600',
      textTransform: 'none',
      letterSpacing: null,
      color: '#ffffff',
      bgColor: '#3b82f6',
      borderRadius: '6px',
      borderWidth: '0px',
      borderColor: 'transparent',
      borderStyle: 'solid',
      boxShadow: null,
      hoverColor: null,
      hoverBgColor: null,
      hoverBorderColor: null,
      hoverBoxShadow: null,
      hoverScale: null,
      hoverTranslateY: null,
      transitionDuration: '200ms',
      transitionEasing: 'ease',
      fullWidth: false,
      customClass: null,
      customId: null,
      responsive: {
        md: { fontSize: '16px', pt: '10px', pr: '24px', pb: '10px', pl: '24px', mt: null, mr: null, mb: null, ml: null, width: null, height: null, display: 'inline-flex', textAlign: 'center' },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'text', label: 'Button Text', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Click Me' },
      { id: 'linkUrl', label: 'Link URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '#', placeholder: 'https://...' },
      { id: 'linkTarget', label: 'Link Target', tab: 'content', group: 'Content', type: 'select', responsive: false, default: '_self', options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }] },
      { id: 'linkType', label: 'Link Type', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'url', options: [{ label: 'URL', value: 'url' }, { label: 'Email', value: 'email' }, { label: 'Phone', value: 'phone' }, { label: 'Anchor', value: 'anchor' }] },
      { id: 'iconName', label: 'Icon', tab: 'content', group: 'Content', type: 'select', responsive: false, default: null, options: [{ label: 'None', value: null }, { label: 'Arrow Right', value: 'ArrowRight' }, { label: 'Arrow Left', value: 'ArrowLeft' }, { label: 'Download', value: 'Download' }, { label: 'External Link', value: 'ExternalLink' }, { label: 'Mail', value: 'Mail' }, { label: 'Phone', value: 'Phone' }, { label: 'Plus', value: 'Plus' }, { label: 'Star', value: 'Star' }] },
      { id: 'iconPosition', label: 'Icon Position', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
      { id: 'iconSize', label: 'Icon Size', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'iconGap', label: 'Icon Gap', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '8px' },
      { id: 'disabled', label: 'Disabled', tab: 'content', group: 'Content', type: 'toggle', responsive: false, default: false },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'textAlign', label: 'Text Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'center', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      { id: 'fullWidth', label: 'Full Width', tab: 'alignment', group: 'Alignment', type: 'toggle', responsive: false, default: false },
      // Design tab - Typography
      { id: 'fontFamily', label: 'Font Family', tab: 'design', group: 'Typography', type: 'font', responsive: false, default: null },
      { id: 'fontSize', label: 'Font Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: '16px' },
      { id: 'fontWeight', label: 'Font Weight', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: '600', options: [{ label: '100', value: '100' }, { label: '200', value: '200' }, { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }] },
      { id: 'textTransform', label: 'Text Transform', tab: 'design', group: 'Typography', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }] },
      { id: 'letterSpacing', label: 'Letter Spacing', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'color', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#ffffff' },
      // Design tab - Normal State
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Normal State', type: 'color', responsive: false, default: '#3b82f6' },
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Normal State', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Normal State', type: 'select', responsive: false, default: 'solid', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Normal State', type: 'color', responsive: false, default: 'transparent' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Normal State', type: 'text', unit: 'px', responsive: false, default: '6px' },
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Normal State', type: 'text', responsive: false, default: null, placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
      // Design tab - Hover State
      { id: 'hoverColor', label: 'Hover Text Color', tab: 'design', group: 'Hover State', type: 'color', responsive: false, default: null },
      { id: 'hoverBgColor', label: 'Hover Background', tab: 'design', group: 'Hover State', type: 'color', responsive: false, default: null },
      { id: 'hoverBorderColor', label: 'Hover Border Color', tab: 'design', group: 'Hover State', type: 'color', responsive: false, default: null },
      { id: 'hoverBoxShadow', label: 'Hover Box Shadow', tab: 'design', group: 'Hover State', type: 'text', responsive: false, default: null, placeholder: '0 6px 16px rgba(0,0,0,0.15)' },
      { id: 'hoverScale', label: 'Hover Scale', tab: 'design', group: 'Hover State', type: 'number', min: 0.5, max: 2, step: 0.05, responsive: false, default: null },
      { id: 'hoverTranslateY', label: 'Hover Translate Y', tab: 'design', group: 'Hover State', type: 'text', unit: 'px', responsive: false, default: null },
      // Design tab - Transition
      { id: 'transitionDuration', label: 'Transition Duration', tab: 'design', group: 'Transition', type: 'text', responsive: false, default: '200ms' },
      { id: 'transitionEasing', label: 'Transition Easing', tab: 'design', group: 'Transition', type: 'select', responsive: false, default: 'ease', options: [{ label: 'Ease', value: 'ease' }, { label: 'Linear', value: 'linear' }, { label: 'Ease In', value: 'ease-in' }, { label: 'Ease Out', value: 'ease-out' }, { label: 'Ease In Out', value: 'ease-in-out' }] },
      // Design tab - Icon
      { id: 'iconColor', label: 'Icon Color', tab: 'design', group: 'Icon', type: 'color', responsive: false, default: null },
      { id: 'iconHoverColor', label: 'Icon Hover Color', tab: 'design', group: 'Icon', type: 'color', responsive: false, default: null },
      // Design tab - Spacing
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: '10px' },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: '24px' },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: '10px' },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: '24px' },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'width', label: 'Width', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'height', label: 'Height', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Effects
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return ButtonComponent; },
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'basic',
    defaults: {
      dividerStyle: 'solid',
      dividerColor: '#e2e8f0',
      showMiddleContent: false,
      middleType: 'none',
      middleText: null,
      middleIconName: null,
      middleContentColor: '#64748b',
      middleContentSize: '16px',
      middleContentBg: null,
      middleContentPadding: '0px 12px',
      customClass: null,
      customId: null,
      responsive: {
        md: { dividerWidth: '100%', dividerThickness: '1px', mt: null, mb: null, textAlign: 'center' },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'dividerStyle', label: 'Divider Style', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'solid', options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }] },
      { id: 'showMiddleContent', label: 'Show Middle Content', tab: 'content', group: 'Content', type: 'toggle', responsive: false, default: false },
      { id: 'middleType', label: 'Middle Type', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Text', value: 'text' }, { label: 'Icon', value: 'icon' }] },
      { id: 'middleText', label: 'Middle Text', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'middleIconName', label: 'Middle Icon', tab: 'content', group: 'Content', type: 'select', responsive: false, default: null, options: [{ label: 'None', value: null }, { label: 'Star', value: 'Star' }, { label: 'Heart', value: 'Heart' }, { label: 'Diamond', value: 'Diamond' }, { label: 'Circle', value: 'Circle' }] },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'textAlign', label: 'Horizontal Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'center', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      // Design tab - Line
      { id: 'dividerColor', label: 'Divider Color', tab: 'design', group: 'Line', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'dividerWidth', label: 'Divider Width', tab: 'design', group: 'Line', type: 'text', unit: '%', responsive: true, default: '100%' },
      { id: 'dividerThickness', label: 'Divider Thickness', tab: 'design', group: 'Line', type: 'text', unit: 'px', responsive: true, default: '1px' },
      // Design tab - Middle Content
      { id: 'middleContentColor', label: 'Middle Content Color', tab: 'design', group: 'Middle Content', type: 'color', responsive: false, default: '#64748b' },
      { id: 'middleContentSize', label: 'Middle Content Size', tab: 'design', group: 'Middle Content', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'middleContentBg', label: 'Middle Content Background', tab: 'design', group: 'Middle Content', type: 'color', responsive: false, default: null },
      { id: 'middleContentPadding', label: 'Middle Content Padding', tab: 'design', group: 'Middle Content', type: 'text', responsive: false, default: '0px 12px' },
      // Design tab - Spacing
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Effects
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return DividerComponent; },
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    icon: MoveVertical,
    category: 'basic',
    defaults: {
      customClass: null,
      customId: null,
      responsive: {
        md: { spacerHeight: '40px' },
        sm: { spacerHeight: '30px' },
        base: { spacerHeight: '20px' },
      },
    },
    controls: [
      // Content tab
      { id: 'spacerHeight_md', label: 'Height (Desktop)', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '40px' },
      { id: 'spacerHeight_sm', label: 'Height (Tablet)', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '30px' },
      { id: 'spacerHeight_base', label: 'Height (Mobile)', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '20px' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab - spacer has no alignment
      // Design tab
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
    ],
    get component() { return SpacerComponent; },
  },
  container: {
    type: 'container',
    label: 'Container',
    icon: Box,
    category: 'layout',
    defaults: {
      tag: 'div',
      bgColor: null,
      bgImage: null,
      bgSize: 'cover',
      bgPosition: 'center center',
      bgRepeat: 'no-repeat',
      bgOverlayColor: null,
      bgOverlayOpacity: 0,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      alignContent: 'flex-start',
      rowGap: '0px',
      columnGap: '0px',
      overflow: 'visible',
      zIndex: 0,
      linkUrl: null,
      linkTarget: '_self',
      customClass: null,
      customId: null,
      responsive: {
        md: { width: null, minWidth: null, maxWidth: null, height: null, minHeight: null, maxHeight: null, pt: null, pr: null, pb: null, pl: null, mt: null, mr: null, mb: null, ml: null, display: 'flex' },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'tag', label: 'HTML Tag', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'div', options: [{ label: 'div', value: 'div' }, { label: 'section', value: 'section' }, { label: 'article', value: 'article' }, { label: 'aside', value: 'aside' }, { label: 'header', value: 'header' }, { label: 'footer', value: 'footer' }, { label: 'main', value: 'main' }, { label: 'nav', value: 'nav' }] },
      { id: 'linkUrl', label: 'Link URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null, placeholder: 'https://...' },
      { id: 'linkTarget', label: 'Link Target', tab: 'content', group: 'Content', type: 'select', responsive: false, default: '_self', options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }] },
      { id: 'overflow', label: 'Overflow', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'visible', options: [{ label: 'Visible', value: 'visible' }, { label: 'Hidden', value: 'hidden' }, { label: 'Scroll', value: 'scroll' }, { label: 'Auto', value: 'auto' }] },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'flexDirection', label: 'Flex Direction', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'row', options: [{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }, { label: 'Row Reverse', value: 'row-reverse' }, { label: 'Column Reverse', value: 'column-reverse' }] },
      { id: 'flexWrap', label: 'Flex Wrap', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'wrap', options: [{ label: 'No Wrap', value: 'nowrap' }, { label: 'Wrap', value: 'wrap' }, { label: 'Wrap Reverse', value: 'wrap-reverse' }] },
      { id: 'justifyContent', label: 'Justify Content', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'flex-start', options: [{ label: 'Flex Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'Flex End', value: 'flex-end' }, { label: 'Space Between', value: 'space-between' }, { label: 'Space Around', value: 'space-around' }, { label: 'Space Evenly', value: 'space-evenly' }] },
      { id: 'alignItems', label: 'Align Items', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'stretch', options: [{ label: 'Stretch', value: 'stretch' }, { label: 'Flex Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'Flex End', value: 'flex-end' }, { label: 'Baseline', value: 'baseline' }] },
      { id: 'alignContent', label: 'Align Content', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'flex-start', options: [{ label: 'Flex Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'Flex End', value: 'flex-end' }, { label: 'Space Between', value: 'space-between' }, { label: 'Space Around', value: 'space-around' }, { label: 'Stretch', value: 'stretch' }] },
      { id: 'rowGap', label: 'Row Gap', tab: 'alignment', group: 'Layout', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'columnGap', label: 'Column Gap', tab: 'alignment', group: 'Layout', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'display', label: 'Display', tab: 'alignment', group: 'Layout', type: 'select', responsive: true, default: 'flex', options: [{ label: 'Flex', value: 'flex' }, { label: 'Block', value: 'block' }, { label: 'Grid', value: 'grid' }, { label: 'None', value: 'none' }] },
      // Design tab - Sizing
      { id: 'width', label: 'Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'minWidth', label: 'Min Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'maxWidth', label: 'Max Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'height', label: 'Height', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'minHeight', label: 'Min Height', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'maxHeight', label: 'Max Height', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Background
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'bgImage', label: 'Background Image', tab: 'design', group: 'Background', type: 'image', responsive: false, default: null },
      { id: 'bgSize', label: 'Background Size', tab: 'design', group: 'Background', type: 'select', responsive: false, default: 'cover', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' }] },
      { id: 'bgPosition', label: 'Background Position', tab: 'design', group: 'Background', type: 'select', responsive: false, default: 'center center', options: [{ label: 'Center', value: 'center center' }, { label: 'Top', value: 'top center' }, { label: 'Bottom', value: 'bottom center' }, { label: 'Left', value: 'left center' }, { label: 'Right', value: 'right center' }] },
      { id: 'bgRepeat', label: 'Background Repeat', tab: 'design', group: 'Background', type: 'select', responsive: false, default: 'no-repeat', options: [{ label: 'No Repeat', value: 'no-repeat' }, { label: 'Repeat', value: 'repeat' }, { label: 'Repeat X', value: 'repeat-x' }, { label: 'Repeat Y', value: 'repeat-y' }] },
      { id: 'bgOverlayColor', label: 'Overlay Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'bgOverlayOpacity', label: 'Overlay Opacity', tab: 'design', group: 'Background', type: 'slider', min: 0, max: 100, step: 1, responsive: false, default: 0 },
      // Design tab - Spacing
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Border
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }] },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      // Design tab - Effects
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null, placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
      { id: 'zIndex', label: 'Z-Index', tab: 'design', group: 'Effects', type: 'number', min: -100, max: 9999, step: 1, responsive: false, default: 0 },
    ],
    get component() { return ContainerComponent; },
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: Image,
    category: 'media',
    defaults: {
      src: null,
      alt: '',
      title: null,
      caption: null,
      linkUrl: null,
      linkTarget: '_self',
      linkType: 'none',
      lazyLoad: true,
      objectFit: 'cover',
      objectPosition: 'center center',
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      filterBlur: null,
      filterBrightness: null,
      filterContrast: null,
      filterGrayscale: null,
      filterSepia: null,
      filterHueRotate: null,
      filterSaturate: null,
      hoverFilterBlur: null,
      hoverFilterBrightness: null,
      hoverFilterGrayscale: null,
      hoverScale: null,
      hoverTranslateY: null,
      transitionDuration: '300ms',
      transitionEasing: 'ease',
      customClass: null,
      customId: null,
      responsive: {
        md: { width: null, maxWidth: null, height: null, display: 'block', textAlign: 'left', mt: null, mr: null, mb: null, ml: null },
        sm: {},
        base: {},
      },
    },
    controls: [
      // Content tab
      { id: 'src', label: 'Image Source', tab: 'content', group: 'Content', type: 'image', responsive: false, default: null },
      { id: 'alt', label: 'Alt Text', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '' },
      { id: 'title', label: 'Title', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'caption', label: 'Caption', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'linkUrl', label: 'Link URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null, placeholder: 'https://...' },
      { id: 'linkTarget', label: 'Link Target', tab: 'content', group: 'Content', type: 'select', responsive: false, default: '_self', options: [{ label: 'Same Tab', value: '_self' }, { label: 'New Tab', value: '_blank' }] },
      { id: 'linkType', label: 'Link Type', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'URL', value: 'url' }, { label: 'Lightbox', value: 'lightbox' }] },
      { id: 'lazyLoad', label: 'Lazy Load', tab: 'content', group: 'Content', type: 'toggle', responsive: false, default: true },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      // Alignment tab
      { id: 'textAlign', label: 'Horizontal Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      // Design tab - Sizing
      { id: 'width', label: 'Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'maxWidth', label: 'Max Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'height', label: 'Height', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: true, default: null },
      // Design tab - Fit
      { id: 'objectFit', label: 'Object Fit', tab: 'design', group: 'Fit', type: 'select', responsive: false, default: 'cover', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }, { label: 'None', value: 'none' }, { label: 'Scale Down', value: 'scale-down' }] },
      { id: 'objectPosition', label: 'Object Position', tab: 'design', group: 'Fit', type: 'select', responsive: false, default: 'center center', options: [{ label: 'Center', value: 'center center' }, { label: 'Top', value: 'top center' }, { label: 'Bottom', value: 'bottom center' }, { label: 'Left', value: 'left center' }, { label: 'Right', value: 'right center' }] },
      // Design tab - Border
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      // Design tab - Effects
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null, placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
      // Design tab - Filters (normal)
      { id: 'filterBlur', label: 'Blur', tab: 'design', group: 'Filters', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'filterBrightness', label: 'Brightness', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 200, step: 5, responsive: false, default: null },
      { id: 'filterContrast', label: 'Contrast', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 200, step: 5, responsive: false, default: null },
      { id: 'filterGrayscale', label: 'Grayscale', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 100, step: 5, responsive: false, default: null },
      { id: 'filterSepia', label: 'Sepia', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 100, step: 5, responsive: false, default: null },
      { id: 'filterHueRotate', label: 'Hue Rotate', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 360, step: 15, responsive: false, default: null },
      { id: 'filterSaturate', label: 'Saturate', tab: 'design', group: 'Filters', type: 'number', min: 0, max: 200, step: 5, responsive: false, default: null },
      // Design tab - Filters (hover)
      { id: 'hoverFilterBlur', label: 'Hover Blur', tab: 'design', group: 'Hover Filters', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'hoverFilterBrightness', label: 'Hover Brightness', tab: 'design', group: 'Hover Filters', type: 'number', min: 0, max: 200, step: 5, responsive: false, default: null },
      { id: 'hoverFilterGrayscale', label: 'Hover Grayscale', tab: 'design', group: 'Hover Filters', type: 'number', min: 0, max: 100, step: 5, responsive: false, default: null },
      // Design tab - Hover Motion
      { id: 'hoverScale', label: 'Hover Scale', tab: 'design', group: 'Hover Motion', type: 'number', min: 0.5, max: 2, step: 0.05, responsive: false, default: null },
      { id: 'hoverTranslateY', label: 'Hover Translate Y', tab: 'design', group: 'Hover Motion', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'transitionDuration', label: 'Transition Duration', tab: 'design', group: 'Hover Motion', type: 'text', responsive: false, default: '300ms' },
      { id: 'transitionEasing', label: 'Transition Easing', tab: 'design', group: 'Hover Motion', type: 'select', responsive: false, default: 'ease', options: [{ label: 'Ease', value: 'ease' }, { label: 'Linear', value: 'linear' }, { label: 'Ease In', value: 'ease-in' }, { label: 'Ease Out', value: 'ease-out' }, { label: 'Ease In Out', value: 'ease-in-out' }] },
      // Design tab - Spacing
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
    ],
    get component() { return ImageComponent; },
  },
  // ============= NEW ELEMENTS =============
  listItem: {
    type: 'listItem',
    label: 'List Item',
    icon: Type,
    category: 'content',
    defaults: {
      text: 'List item text',
      icon: null,
      iconType: 'lucide',
      iconSize: '24px',
      iconColor: null,
      textColor: '#000000',
      bgColor: null,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      gap: '8px',
      padding: '8px',
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'text', label: 'Text', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'List item text' },
      { id: 'icon', label: 'Icon', tab: 'content', group: 'Icon', type: 'iconPicker', responsive: false, default: null },
      { id: 'iconType', label: 'Icon Type', tab: 'content', group: 'Icon', type: 'select', responsive: false, default: 'lucide', options: [{ label: 'Lucide', value: 'lucide' }, { label: 'Image', value: 'image' }] },
      { id: 'iconSize', label: 'Icon Size', tab: 'content', group: 'Icon', type: 'text', unit: 'px', responsive: false, default: '24px' },
      { id: 'iconColor', label: 'Icon Color', tab: 'content', group: 'Icon', type: 'color', responsive: false, default: null },
      { id: 'textColor', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] },
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null },
      { id: 'gap', label: 'Gap', tab: 'design', group: 'Layout', type: 'text', unit: 'px', responsive: false, default: '8px' },
      { id: 'padding', label: 'Padding', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: false, default: '8px' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return ListItemComponent; },
  },
  iconElement: {
    type: 'iconElement',
    label: 'Icon',
    icon: Type,
    category: 'media',
    defaults: {
      source: 'lucide',
      icon: null,
      reactIcon: null,
      imageUrl: null,
      iconSize: '32px',
      iconColor: null,
      bgColor: null,
      borderRadius: '0px',
      padding: '8px',
      boxShadow: null,
      linkUrl: null,
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'source', label: 'Source', tab: 'content', group: 'Content', type: 'select', responsive: false, default: 'lucide', options: [{ label: 'Lucide', value: 'lucide' }, { label: 'React Icons', value: 'react' }, { label: 'Image', value: 'image' }] },
      { id: 'icon', label: 'Icon', tab: 'content', group: 'Content', type: 'iconPicker', responsive: false, default: null },
      { id: 'reactIcon', label: 'React Icon Name', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'imageUrl', label: 'Image URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'iconSize', label: 'Icon Size', tab: 'content', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '32px' },
      { id: 'iconColor', label: 'Icon Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: null },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'padding', label: 'Padding', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: false, default: '8px' },
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null },
      { id: 'linkUrl', label: 'Link URL', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return IconElementComponent; },
  },
  nestedTimeline: {
    type: 'nestedTimeline',
    label: 'Nested Timeline',
    icon: Type,
    category: 'content',
    defaults: {
      phases: [],
      bgColor: null,
      padding: '64px 16px',
      lineWidth: '1px',
      lineColor: '#fca5a5',
      milestoneSize: '80px',
      milestoneBorderColor: '#fca5a5',
      milestoneColor: '#f87171',
      phaseIconSize: '64px',
      phaseIconColor: '#334155',
      phaseTitleSize: '36px',
      phaseTitleColor: '#1e293b',
      phaseDescSize: '18px',
      phaseDescColor: '#64748b',
      subStepsIconSize: '380px',
      subStepsIconColor: '#fca5a5',
      connectorDotSize: '20px',
      connectorDotBorder: '#fca5a5',
      stepTitleSize: '16px',
      stepTitleColor: '#f87171',
      stepDescSize: '17px',
      stepDescColor: '#64748b',
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'phases', label: 'Phases (JSON)', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '[]' },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'padding', label: 'Padding', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: false, default: '64px 16px' },
      { id: 'lineWidth', label: 'Line Width', tab: 'design', group: 'Timeline', type: 'text', unit: 'px', responsive: false, default: '1px' },
      { id: 'lineColor', label: 'Line Color', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#fca5a5' },
      { id: 'milestoneSize', label: 'Milestone Size', tab: 'design', group: 'Timeline', type: 'text', unit: 'px', responsive: false, default: '80px' },
      { id: 'milestoneBorderColor', label: 'Milestone Border', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#fca5a5' },
      { id: 'milestoneColor', label: 'Milestone Color', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#f87171' },
      { id: 'phaseIconSize', label: 'Phase Icon Size', tab: 'design', group: 'Timeline', type: 'text', unit: 'px', responsive: false, default: '64px' },
      { id: 'phaseIconColor', label: 'Phase Icon Color', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#334155' },
      { id: 'phaseTitleSize', label: 'Phase Title Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: '36px' },
      { id: 'phaseTitleColor', label: 'Phase Title Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#1e293b' },
      { id: 'phaseDescSize', label: 'Phase Desc Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: '18px' },
      { id: 'phaseDescColor', label: 'Phase Desc Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#64748b' },
      { id: 'subStepsIconSize', label: 'Sub Steps Icon Size', tab: 'design', group: 'Timeline', type: 'text', unit: 'px', responsive: false, default: '380px' },
      { id: 'subStepsIconColor', label: 'Sub Steps Icon Color', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#fca5a5' },
      { id: 'connectorDotSize', label: 'Connector Dot Size', tab: 'design', group: 'Timeline', type: 'text', unit: 'px', responsive: false, default: '20px' },
      { id: 'connectorDotBorder', label: 'Connector Dot Border', tab: 'design', group: 'Timeline', type: 'color', responsive: false, default: '#fca5a5' },
      { id: 'stepTitleSize', label: 'Step Title Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'stepTitleColor', label: 'Step Title Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#f87171' },
      { id: 'stepDescSize', label: 'Step Desc Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: false, default: '17px' },
      { id: 'stepDescColor', label: 'Step Desc Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#64748b' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return NestedTimelineComponent; },
  },
  imageBox: {
    type: 'imageBox',
    label: 'Image Box',
    icon: Image,
    category: 'media',
    defaults: {
      image: null,
      title: 'Image Box Title',
      text: 'Description text here',
      titleLevel: '4',
      textColor: '#000000',
      imageWidth: '120px',
      flexDir: 'row',
      gap: '12px',
      bgColor: null,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      boxShadow: null,
      padding: '16px',
      customClass: null,
      customId: null,
      responsive: { md: { fontSize: null, lineHeight: null }, sm: {}, base: {} },
    },
    controls: [
      { id: 'image', label: 'Image', tab: 'content', group: 'Content', type: 'image', responsive: false, default: null },
      { id: 'title', label: 'Title', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Image Box Title' },
      { id: 'text', label: 'Description', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Description text here' },
      { id: 'titleLevel', label: 'Title Level', tab: 'content', group: 'Content', type: 'select', responsive: false, default: '4', options: [{ label: 'H1', value: '1' }, { label: 'H2', value: '2' }, { label: 'H3', value: '3' }, { label: 'H4', value: '4' }, { label: 'H5', value: '5' }, { label: 'H6', value: '6' }] },
      { id: 'textColor', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'imageWidth', label: 'Image Width', tab: 'design', group: 'Image', type: 'text', unit: 'px', responsive: false, default: '120px' },
      { id: 'flexDir', label: 'Direction', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'row', options: [{ label: 'Row', value: 'row' }, { label: 'Row Reverse', value: 'row-reverse' }, { label: 'Column', value: 'column' }, { label: 'Column Reverse', value: 'column-reverse' }] },
      { id: 'gap', label: 'Gap', tab: 'alignment', group: 'Layout', type: 'text', unit: 'px', responsive: false, default: '12px' },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderWidth', label: 'Border Width', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderStyle', label: 'Border Style', tab: 'design', group: 'Border', type: 'select', responsive: false, default: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] },
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null },
      { id: 'padding', label: 'Padding', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'fontSize', label: 'Title Font Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'lineHeight', label: 'Title Line Height', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return ImageBoxComponent; },
  },
  accordionItem: {
    type: 'accordionItem',
    label: 'Accordion',
    icon: Type,
    category: 'content',
    defaults: {
      title: 'Accordion Title',
      text: 'Accordion content goes here',
      icon: null,
      iconSize: '16px',
      iconColor: null,
      iconWidth: '24px',
      iconHeight: '24px',
      titleBgColor: '#f8fafc',
      titleTextColor: '#1e293b',
      titlePadding: '12px 16px',
      contentBgColor: '#ffffff',
      contentTextColor: '#334155',
      padding: '16px',
      borderTopWidth: '1px',
      borderRightWidth: '1px',
      borderBottomWidth: '1px',
      borderLeftWidth: '1px',
      borderColor: '#e2e8f0',
      borderRadius: '0px',
      width: null,
      height: null,
      textAlign: 'left',
      boxShadow: null,
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'title', label: 'Title', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Accordion Title' },
      { id: 'text', label: 'Content', tab: 'content', group: 'Content', type: 'text', responsive: false, default: 'Accordion content goes here' },
      { id: 'icon', label: 'Icon', tab: 'content', group: 'Icon', type: 'iconPicker', responsive: false, default: null },
      { id: 'iconSize', label: 'Icon Size', tab: 'content', group: 'Icon', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'iconColor', label: 'Icon Color', tab: 'content', group: 'Icon', type: 'color', responsive: false, default: null },
      { id: 'iconWidth', label: 'Icon Width', tab: 'content', group: 'Icon', type: 'text', unit: 'px', responsive: false, default: '24px' },
      { id: 'iconHeight', label: 'Icon Height', tab: 'content', group: 'Icon', type: 'text', unit: 'px', responsive: false, default: '24px' },
      { id: 'titleBgColor', label: 'Title BG', tab: 'design', group: 'Title', type: 'color', responsive: false, default: '#f8fafc' },
      { id: 'titleTextColor', label: 'Title Text Color', tab: 'design', group: 'Title', type: 'color', responsive: false, default: '#1e293b' },
      { id: 'titlePadding', label: 'Title Padding', tab: 'design', group: 'Title', type: 'text', unit: 'px', responsive: false, default: '12px 16px' },
      { id: 'contentBgColor', label: 'Content BG', tab: 'design', group: 'Content', type: 'color', responsive: false, default: '#ffffff' },
      { id: 'contentTextColor', label: 'Content Text Color', tab: 'design', group: 'Content', type: 'color', responsive: false, default: '#334155' },
      { id: 'padding', label: 'Content Padding', tab: 'design', group: 'Content', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'borderTopWidth', label: 'Border Top', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '1px' },
      { id: 'borderRightWidth', label: 'Border Right', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '1px' },
      { id: 'borderBottomWidth', label: 'Border Bottom', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '1px' },
      { id: 'borderLeftWidth', label: 'Border Left', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '1px' },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '0px' },
      { id: 'width', label: 'Width', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'height', label: 'Height', tab: 'design', group: 'Sizing', type: 'text', unit: 'px', responsive: false, default: null },
      { id: 'textAlign', label: 'Text Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      { id: 'boxShadow', label: 'Box Shadow', tab: 'design', group: 'Effects', type: 'text', responsive: false, default: null },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return AccordionItemComponent; },
  },
  widget: {
    type: 'widget',
    label: 'Widget',
    icon: Box,
    category: 'content',
    defaults: {
      widgetName: null,
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'widgetName', label: 'Widget', tab: 'content', group: 'Content', type: 'select', responsive: false, default: null, options: [{ label: 'None', value: null }] },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return WidgetComponent; },
  },
  counter: {
    type: 'counter',
    label: 'Counter',
    icon: Type,
    category: 'content',
    defaults: {
      value: '1000',
      prefix: '',
      suffix: '',
      duration: 2,
      numberColor: '#000000',
      bgColor: null,
      padding: '16px',
      textAlign: 'center',
      customClass: null,
      customId: null,
      responsive: { md: { fontSize: null, fontWeight: null }, sm: {}, base: {} },
    },
    controls: [
      { id: 'value', label: 'Target Value', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '1000' },
      { id: 'prefix', label: 'Prefix', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '' },
      { id: 'suffix', label: 'Suffix', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '' },
      { id: 'duration', label: 'Duration (s)', tab: 'content', group: 'Content', type: 'number', min: 0.5, max: 10, step: 0.5, responsive: false, default: 2 },
      { id: 'numberColor', label: 'Number Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'padding', label: 'Padding', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: false, default: '16px' },
      { id: 'textAlign', label: 'Text Align', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'center', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'fontSize', label: 'Font Size', tab: 'design', group: 'Typography', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'fontWeight', label: 'Font Weight', tab: 'design', group: 'Typography', type: 'text', responsive: true, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return CounterComponent; },
  },
  menu: {
    type: 'menu',
    label: 'Menu',
    icon: Type,
    category: 'content',
    defaults: {
      menuId: null,
      bgColor: null,
      textColor: '#000000',
      hoverColor: '#3b82f6',
      align: 'left',
      menuDirection: 'horizontal',
      gap: '24px',
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'menuId', label: 'Menu', tab: 'content', group: 'Content', type: 'select', responsive: false, default: null, options: [{ label: 'None', value: null }] },
      { id: 'bgColor', label: 'Background Color', tab: 'design', group: 'Background', type: 'color', responsive: false, default: null },
      { id: 'textColor', label: 'Text Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#000000' },
      { id: 'hoverColor', label: 'Hover Color', tab: 'design', group: 'Typography', type: 'color', responsive: false, default: '#3b82f6' },
      { id: 'align', label: 'Alignment', tab: 'alignment', group: 'Alignment', type: 'select', responsive: true, default: 'left', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      { id: 'menuDirection', label: 'Direction', tab: 'alignment', group: 'Layout', type: 'select', responsive: false, default: 'horizontal', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }] },
      { id: 'gap', label: 'Gap', tab: 'alignment', group: 'Layout', type: 'text', unit: 'px', responsive: false, default: '24px' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return MenuComponent; },
  },
  tabs: {
    type: 'tabs',
    label: 'Tabs',
    icon: Type,
    category: 'content',
    defaults: {
      tabs: [],
      activeTab: 0,
      tabBgColor: '#f8fafc',
      tabTextColor: '#64748b',
      activeTabBgColor: '#ffffff',
      activeTabTextColor: '#1e293b',
      contentBgColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderRadius: '8px',
      customClass: null,
      customId: null,
      responsive: { md: {}, sm: {}, base: {} },
    },
    controls: [
      { id: 'tabs', label: 'Tabs (JSON)', tab: 'content', group: 'Content', type: 'text', responsive: false, default: '[]' },
      { id: 'activeTab', label: 'Active Tab', tab: 'content', group: 'Content', type: 'number', min: 0, max: 20, step: 1, responsive: false, default: 0 },
      { id: 'tabBgColor', label: 'Tab BG', tab: 'design', group: 'Tabs', type: 'color', responsive: false, default: '#f8fafc' },
      { id: 'tabTextColor', label: 'Tab Text', tab: 'design', group: 'Tabs', type: 'color', responsive: false, default: '#64748b' },
      { id: 'activeTabBgColor', label: 'Active Tab BG', tab: 'design', group: 'Tabs', type: 'color', responsive: false, default: '#ffffff' },
      { id: 'activeTabTextColor', label: 'Active Tab Text', tab: 'design', group: 'Tabs', type: 'color', responsive: false, default: '#1e293b' },
      { id: 'contentBgColor', label: 'Content BG', tab: 'design', group: 'Content', type: 'color', responsive: false, default: '#ffffff' },
      { id: 'borderColor', label: 'Border Color', tab: 'design', group: 'Border', type: 'color', responsive: false, default: '#e2e8f0' },
      { id: 'borderRadius', label: 'Border Radius', tab: 'design', group: 'Border', type: 'text', unit: 'px', responsive: false, default: '8px' },
      { id: 'customClass', label: 'Custom Class', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'customId', label: 'Custom ID', tab: 'content', group: 'Content', type: 'text', responsive: false, default: null },
      { id: 'pt', label: 'Padding Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pr', label: 'Padding Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pb', label: 'Padding Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'pl', label: 'Padding Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mt', label: 'Margin Top', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mr', label: 'Margin Right', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'mb', label: 'Margin Bottom', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'ml', label: 'Margin Left', tab: 'design', group: 'Spacing', type: 'text', unit: 'px', responsive: true, default: null },
      { id: 'opacity', label: 'Opacity', tab: 'design', group: 'Effects', type: 'slider', min: 0, max: 100, step: 1, responsive: false },
    ],
    get component() { return TabsComponent; },
  },
};

// ============= ELEMENT FACTORY FUNCTIONS =============

export const createElementNode = (elementType: string) => {
  const def = elementDefinitions[elementType];
  if (!def) {
    throw new Error(`Unknown element type: ${elementType}`);
  }
  const node: any = {
    id: `${elementType}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: elementType,
    props: JSON.parse(JSON.stringify(def.defaults)),
  };
  if (elementType === 'container') {
    node.children = [];
  }
  return node;
};

export const elementCategories = ['layout', 'content', 'media', 'actions'];

export const categoryLabels = {
  layout: 'Layout',
  content: 'Content',
  media: 'Media',
  actions: 'Actions'
};

export const findComponentDefinition = (elementType: string) => {
  return elementDefinitions[elementType] || null;
};

// ============= RESPONSIVE STYLE FUNCTIONS =============

export function generateResponsiveStyles(blockId: string, responsive: Record<string, any> | undefined): React.ReactElement | null {
  if (!responsive) {
    return null;
  }

  let css = '';
   
  // Breakpoint media queries - defined in mobile-first order
  const bpMap: Record<string, { minWidth: string; maxWidth: string | null }> = { 
    base: { minWidth: '', maxWidth: '767px' },         // Mobile: 0-767px
    sm: { minWidth: '768px', maxWidth: '1023px' },    // Tablet: 768-1023px
    md: { minWidth: '1024px', maxWidth: '' },          // Desktop: 1024px+
  };
  
  // ✅ Iterate in correct mobile-first order: base, sm, md
  const breakpointOrder: Breakpoint[] = ['base', 'sm', 'md'];
  
  breakpointOrder.forEach((bp) => {
    const props = responsive[bp];
    if (!props || Object.keys(props).length === 0) return;
    
    const bpConfig = bpMap[bp];
    if (!bpConfig) return;
    
    // ✅ Accumulate ALL rules for this breakpoint using propMap
    let allRules = '';
    
    Object.entries(props).forEach(([key, val]) => {
      if (!val) return;
      
      // Use the comprehensive propMap to convert short-form to CSS property
      const mapping = propMap[key];
      if (!mapping) return;
      
      const cssProp = mapping.css;
      let rule = `${cssProp}: ${val} !important; `;
      
      // Special handling for zIndex which also needs position
      if (key === 'zIndex') {
        rule += `position: relative !important; `;
      }
      
      // Special handling for visibility
      if (key === 'visibility') {
        const displayVal = val === 'hidden' ? 'none' : val;
        rule = `display: ${displayVal} !important; `;
      }
      
      if (rule) {
        allRules += rule; // ✅ Accumulate ALL rules
      }
    });
    
    // ✅ Create ONE CSS rule for this breakpoint with ALL properties
    if (allRules) {
      let mediaQuery = '';
      if (bpConfig.minWidth && bpConfig.maxWidth) {
        mediaQuery = `@media (min-width: ${bpConfig.minWidth}) and (max-width: ${bpConfig.maxWidth}) { #${blockId} { ${allRules} } }\n`;
      } else if (bpConfig.minWidth) {
        mediaQuery = `@media (min-width: ${bpConfig.minWidth}) { #${blockId} { ${allRules} } }\n`;
      } else if (bpConfig.maxWidth) {
        mediaQuery = `@media (max-width: ${bpConfig.maxWidth}) { #${blockId} { ${allRules} } }\n`;
      } else {
        // md (desktop) - no media query
        mediaQuery = `#${blockId} { ${allRules} }\n`;
      }
      css += mediaQuery;
    }
  });

  if (!css) {
    return null;
  }
  
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export const extractTypographyStyles = (props: any, prefix = '') => ({
  fontSize: props[prefix + 'fontSize'] || undefined,
  fontWeight: props[prefix + 'fontWeight'] || undefined,
  textTransform: props[prefix + 'textTransform'] || undefined,
  letterSpacing: props[prefix + 'letterSpacing'] || undefined,
  wordSpacing: props[prefix + 'wordSpacing'] || undefined,
  lineHeight: props[prefix + 'lineHeight'] || undefined
});

export const cssPropertyMap: Record<string, string> = {
  // Typography
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  textAlign: 'textAlign',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
  wordSpacing: 'wordSpacing',
  textTransform: 'textTransform',
  // Layout
  display: 'display',
  flexDir: 'flexDirection',
  flexDirection: 'flexDirection',
  flexWrap: 'flexWrap',
  justifyContent: 'justifyContent',
  justify: 'justifyContent',
  alignItems: 'alignItems',
  items: 'alignItems',
  alignContent: 'alignContent',
  gap: 'gap',
  rowGap: 'rowGap',
  columnGap: 'columnGap',
  columns: 'columns',
  // Sizing
  width: 'width',
  height: 'height',
  minWidth: 'minWidth',
  minHeight: 'minHeight',
  maxWidth: 'maxWidth',
  maxHeight: 'maxHeight',
  maxWidthC: 'maxWidth',
  // Padding short-forms
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  paddingTop: 'paddingTop',
  paddingRight: 'paddingRight',
  paddingBottom: 'paddingBottom',
  paddingLeft: 'paddingLeft',
  padding: 'padding',
  // Margin short-forms
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  marginTop: 'marginTop',
  marginRight: 'marginRight',
  marginBottom: 'marginBottom',
  marginLeft: 'marginLeft',
  margin: 'margin',
  // Border & effects
  rounded: 'borderRadius',
  borderRadius: 'borderRadius',
  overflow: 'overflow',
  boxShadow: 'boxShadow',
  zIndex: 'zIndex',
  visibility: 'visibility',
  // Spacer & Divider specific
  spacerHeight: 'height',
  dividerWidth: 'width',
  dividerThickness: 'borderTopWidth',
  // Legacy aliases
  menuTextTransform: 'textTransform',
  textAlignProp: 'textAlign',
};

export const mergeResponsiveStyles = (responsiveConfig: any, activeBreakpoint: string) => {
  if (!responsiveConfig) return {};

  const breakpointKeys = breakpoints.map(bp => bp.key);
  const activeIndex = breakpointKeys.indexOf(activeBreakpoint);
  const mergedStyles: any = {};

  for (let i = 0; i <= activeIndex; i++) {
    const breakpointKey = breakpointKeys[i];
    const breakpointProps = responsiveConfig[breakpointKey];
    if (!breakpointProps) continue;

    Object.entries(breakpointProps).forEach(([propKey, propValue]) => {
      if (!propValue) return;

      if (propKey === 'gridCols') {
        mergedStyles.gridTemplateColumns = `repeat(${propValue}, minmax(0, 1fr))`;
      } else if (propKey === 'gridRows') {
        mergedStyles.gridTemplateRows = `repeat(${propValue}, minmax(0, 1fr))`;
      } else if (propKey === 'colSpan') {
        mergedStyles.gridColumn = `span ${propValue} / span ${propValue}`;
      } else if (propKey === 'visibility') {
        mergedStyles.display = propValue === 'hidden' ? 'none' : propValue;
      } else {
        // Keep short-form keys (pt, mt, etc.) - do NOT convert via cssPropertyMap
        // cssPropertyMap is only used in generateResponsiveStyles() for CSS output
        mergedStyles[propKey] = propValue;
      }
    });
  }

  return mergedStyles;
};

export const resetNodeIds = (node: any) => ({
  ...node,
  id: `block-${node.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  children: (node.children || []).map(resetNodeIds)
});

// ============= EXPORT INDIVIDUAL ELEMENTS =============

export const HeadingElement = elementDefinitions.heading;
export const TextElement = elementDefinitions.paragraph;
export const ButtonElement = elementDefinitions.button;
export const ContainerElement = elementDefinitions.container;
export const ImageElement = elementDefinitions.image;
export const DividerElement = elementDefinitions.divider;
export const SpacerElement = elementDefinitions.spacer;

// ============= ELEMENT COLLECTIONS =============

export const ELEMENTS = Object.values(elementDefinitions);

export const ELEMENTS_BY_TYPE: Record<string, any> = {};
ELEMENTS.forEach(el => { ELEMENTS_BY_TYPE[el.type] = el; });

export const ELEMENTS_BY_CATEGORY: Record<string, any[]> = {};
ELEMENTS.forEach(el => {
  if (!ELEMENTS_BY_CATEGORY[el.category]) {
    ELEMENTS_BY_CATEGORY[el.category] = [];
  }
  ELEMENTS_BY_CATEGORY[el.category].push(el);
});

export const CONTAINER_TYPES = ['container'];

// ============= COMPONENTS =============

// Heading Component - SIMPLIFIED & ROBUST
export const HeadingComponent: React.FC<any> = (props) => {
  const {
    text, content, level, align, textAlign, color, bgColor, bgImage, bgSize,
    minHeight, borderRadius, borderWidth, borderColor, borderStyle,
    opacity, width, height, textDecoration, fontSize, fontWeight,
    textTransform, letterSpacing, wordSpacing, lineHeight,
    id, customClass, customId, boxShadow, zIndex, responsive,
    fontFamily, fontStyle, textShadow, linkUrl, linkTarget, tag,
    pt, pr, pb, pl, mt, mr, mb, ml
  } = props;

  // Normalize heading level
  const getTag = (levelProp: any): string => {
    if (!levelProp) return 'h2';
    const str = levelProp.toString();
    if (str.startsWith('h')) return str;
    if (str.startsWith('heading-')) return `h${str.replace('heading-', '')}`;
    return `h${str}`;
  };

  const Tag = (tag || getTag(level)) as keyof JSX.IntrinsicElements;
  const htmlContent = text || content || 'Your Heading';

  // Background
  let bg = bgColor || undefined;
  if (bgImage) {
    bg = `url(${cleanUrl(bgImage)}) center / ${bgSize || 'cover'} no-repeat`;
  }

  // Use textAlign if available (responsive), fall back to align (legacy)
  const alignment = textAlign || align || undefined;
  const alignClass = alignment ? getTextAlignmentClass(alignment) : '';

  // Build text shadow
  const textShadowStyle = textShadow || undefined;

  // Build font family
  const fontFamilyStyle = fontFamily || undefined;

  return (
    <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
      <Tag
        id={id}
        className={customClass || ''}
        style={{
          color: color || undefined,
          textDecoration: textDecoration || undefined,
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          width: width || undefined,
          height: height || undefined,
          background: bg,
          minHeight: minHeight || undefined,
          borderRadius: borderRadius || undefined,
          borderColor: borderColor || undefined,
          borderWidth: borderWidth || undefined,
          borderStyle: (borderWidth && borderWidth !== '0px') ? 'solid' : 'none',
          textAlign: alignment as any || undefined,
          boxShadow: boxShadow || undefined,
          zIndex: zIndex ?? undefined,
          position: (zIndex ?? null) !== null ? 'relative' : undefined,
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
          textTransform: (textTransform && textTransform !== 'none') ? textTransform : undefined,
          letterSpacing: (letterSpacing && letterSpacing !== 'normal') ? letterSpacing : undefined,
          wordSpacing: (wordSpacing && wordSpacing !== 'normal') ? wordSpacing : undefined,
          lineHeight: (lineHeight && lineHeight !== 'normal') ? lineHeight : undefined,
          fontFamily: fontFamilyStyle,
          fontStyle: (fontStyle && fontStyle !== 'normal') ? fontStyle : undefined,
          textShadow: textShadowStyle,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// Text Component (Paragraph) - SIMPLIFIED & ROBUST
export const TextComponent: React.FC<any> = (props) => {
  const {
    text, html, content, align, textAlign, color, textDecoration, opacity, minHeight,
    fontSize, fontWeight, textTransform, letterSpacing, wordSpacing, lineHeight,
    id, customClass, customId, boxShadow, zIndex, responsive,
    fontFamily, fontStyle, textShadow, bgColor, borderRadius, borderWidth, borderColor, borderStyle,
    pt, pr, pb, pl, mt, mr, mb, ml, maxWidth, columns, columnGap, dropCap
  } = props;

  const htmlContent = text || html || content || '<p>Your paragraph text goes here.</p>';
  // Use textAlign if available (responsive), fall back to align (legacy)
  const alignment = textAlign || align || undefined;
  const alignClass = alignment ? getTextAlignmentClass(alignment) : '';

  // Build column styles
  const columnStyle = columns && columns !== '1' ? { columns, columnGap: columnGap || undefined } : {};

  // Build drop cap style
  const dropCapStyle = dropCap ? {
    '&::first-letter': {
      fontSize: '3em',
      float: 'left',
      lineHeight: '0.8',
      marginRight: '0.1em',
      fontWeight: '700',
    }
  } : {};

  return (
    <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
      <div
        id={id}
        className={customClass || ''}
        style={{
          color: color || undefined,
          textDecoration: textDecoration || undefined,
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          minHeight: minHeight || undefined,
          boxShadow: boxShadow || undefined,
          textAlign: alignment as any || undefined,
          zIndex: zIndex ?? undefined,
          position: (zIndex ?? null) !== null ? 'relative' : undefined,
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
          textTransform: (textTransform && textTransform !== 'none') ? textTransform : undefined,
          letterSpacing: (letterSpacing && letterSpacing !== 'normal') ? letterSpacing : undefined,
          wordSpacing: (wordSpacing && wordSpacing !== 'normal') ? wordSpacing : undefined,
          lineHeight: (lineHeight && lineHeight !== 'normal') ? lineHeight : undefined,
          fontFamily: fontFamily || undefined,
          fontStyle: (fontStyle && fontStyle !== 'normal') ? fontStyle : undefined,
          textShadow: textShadow || undefined,
          background: bgColor || undefined,
          borderRadius: borderRadius || undefined,
          borderColor: borderColor || undefined,
          borderWidth: borderWidth || undefined,
          borderStyle: (borderWidth && borderWidth !== '0px') ? 'solid' : 'none',
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          maxWidth: maxWidth || undefined,
          ...columnStyle,
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// Button Component - SIMPLIFIED & ROBUST
export const ButtonComponent: React.FC<any> = (props) => {
  const {
    text, label, linkUrl, url, href, bgColor, color, textColor, borderRadius, borderWidth, borderColor, borderStyle,
    size, align, textAlign, padding, icon, iconName, iconPos, iconPosition, iconSize, iconColor, iconGap,
    hoverBg, hoverColor, hoverBgColor, hoverBorderColor, hoverBorderWidth, hoverBorderStyle, hoverScale, hoverTranslateY,
    id, customClass, customId, boxShadow, zIndex, responsive,
    fontFamily, fontWeight, textTransform, letterSpacing,
    transitionDuration, transitionEasing, disabled, fullWidth,
    pt, pr, pb, pl, mt, mr, mb, ml, width, height, display, fontSize, linkTarget
  } = props;

  // Support both old and new prop names
  const btnText = text || label || 'Click Me';
  const btnUrl = linkUrl || url || href || '#';
  const btnColor = color || textColor || undefined;
  const btnIconName = iconName || icon || '';
  const btnIconPos = iconPosition || iconPos || 'left';
  const btnHoverBg = hoverBgColor || hoverBg || bgColor || undefined;
  const btnHoverColor = hoverColor || btnColor;
  const btnHoverBorderColor = hoverBorderColor || borderColor || undefined;
  const btnHoverScale = hoverScale || undefined;
  const btnHoverTranslateY = hoverTranslateY || undefined;
  const btnTransitionDuration = transitionDuration || undefined;
  const btnTransitionEasing = transitionEasing || undefined;
  const btnDisabled = disabled || false;
  const btnFullWidth = fullWidth || false;

  // Dynamically load lucide icon
  const [Icon, setIcon] = useState<any>(null);

  useEffect(() => {
    if (btnIconName) {
      import('lucide-react').then((module) => {
        const IconComponent = (module as any)[btnIconName];
        setIcon(IconComponent || null);
      });
    } else {
      setIcon(null);
    }
  }, [btnIconName]);

  // Use textAlign if available (responsive), fall back to align (legacy)
  const alignment = textAlign || align || undefined;
  const alignClass = alignment ? getTextAlignmentClass(alignment) : '';

  const hoverStyle = (btnHoverBg || btnHoverColor || btnHoverBorderColor || btnHoverScale || btnHoverTranslateY) ? `
    #${id}:hover {
      ${btnHoverBg ? `background-color: ${btnHoverBg} !important;` : ''}
      ${btnHoverColor ? `color: ${btnHoverColor} !important;` : ''}
      ${btnHoverBorderColor ? `border-color: ${btnHoverBorderColor} !important;` : ''}
      ${btnHoverScale || btnHoverTranslateY ? `transform: scale(${btnHoverScale || 1}) translateY(${btnHoverTranslateY || 0}px) !important;` : ''}
    }
  ` : '';

  return (
    <>
      {hoverStyle && <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />}
      <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
        <a
          id={id}
          href={btnDisabled ? undefined : btnUrl}
          className={`inline-flex items-center gap-2 ${btnDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          style={{
            backgroundColor: bgColor || undefined,
            borderRadius: borderRadius || undefined,
            color: btnColor,
            borderWidth: borderWidth || undefined,
            borderStyle: borderStyle || undefined,
            borderColor: borderColor || undefined,
            padding: padding || undefined,
            justifyContent: 'center',
            boxShadow: boxShadow || undefined,
            zIndex: zIndex ?? undefined,
            position: (zIndex ?? null) !== null ? 'relative' : undefined,
            fontFamily: fontFamily || undefined,
            fontWeight: fontWeight || undefined,
            textTransform: (textTransform && textTransform !== 'none') ? textTransform : undefined,
            letterSpacing: letterSpacing || undefined,
            fontSize: fontSize || undefined,
            width: btnFullWidth ? '100%' : (width || undefined),
            height: height || undefined,
            display: display || undefined,
            paddingTop: pt || undefined,
            paddingRight: pr || undefined,
            paddingBottom: pb || undefined,
            paddingLeft: pl || undefined,
            marginTop: mt || undefined,
            marginRight: mr || undefined,
            marginBottom: mb || undefined,
            marginLeft: ml || undefined,
            gap: iconGap || undefined,
            ...(btnTransitionDuration && btnTransitionEasing ? { transition: `all ${btnTransitionDuration} ${btnTransitionEasing}` } : {}),
          }}
          target={linkTarget || '_self'}
        >
          {btnIconName && btnIconPos !== 'right' && Icon && <Icon size={parseInt(iconSize) || 16} color={iconColor || btnColor} />}
          {btnText}
          {btnIconName && btnIconPos === 'right' && Icon && <Icon size={parseInt(iconSize) || 16} color={iconColor || btnColor} />}
        </a>
      </div>
    </>
  );
};

// Container Component - SIMPLIFIED & ROBUST
export const ContainerComponent: React.FC<any> = (props) => {
  // ✅ Destructure everything EXCEPT flexDirection, justifyContent, alignItems, margin props
    const {
      bgColor, bgImage, bgSize, width, height, minWidth, minHeight, maxWidth, maxHeight,
      borderRadius, borderWidth, borderColor, borderStyle, padding, direction, align, justify, gap,
      children, responsive, id, customClass, customId, boxShadow, zIndex, textAlign, flexWrap, display, flexDir, items,
      bgGradient, bgGradientDirection, bgGradientType, bgGradientColor1, bgGradientColor2, tag, linkUrl,
      margin, marginTop, marginRight, marginBottom, marginLeft, activeBreakpoint, className: dndClassName
      } = props;

  // ✅ READ DIRECTLY FROM PROPS (not from destructuring):
  const flexDirFromProps = props.flexDirection;
  const justifyContentFromProps = props.justifyContent;
  const alignItemsFromProps = props.alignItems;

  // ✅ MERGE RESPONSIVE STYLES for builder preview
  // Use activeBreakpoint from props (passed by renderNode), default to 'md' for preview
  const bp = activeBreakpoint || 'md';
  const responsiveStyles = mergeResponsiveStyles(responsive || {}, bp);

  // Map alignment values
  const mapJustify = (j: string): string => {
    if (j === 'start') return 'flex-start';
    if (j === 'center') return 'center';
    if (j === 'end') return 'flex-end';
    if (j === 'between') return 'space-between';
    if (j === 'around') return 'space-around';
    if (j === 'evenly') return 'space-evenly';
    return j || 'flex-start';
  };

  const mapAlign = (a: string): string => {
    if (!a || a === 'stretch') return 'stretch';
    if (a === 'start') return 'flex-start';
    if (a === 'center') return 'center';
    if (a === 'end') return 'flex-end';
    if (a === 'baseline') return 'baseline';
    return a || 'stretch';
  };

  // Build background
  let bg = bgColor || undefined;
  const bw = borderWidth ? (isNaN(Number(borderWidth)) ? borderWidth : `${borderWidth}px`) : undefined;

  if (bgImage) {
    bg = `url(${cleanUrl(bgImage)}) center / ${bgSize ?? 'cover'} no-repeat`;
  }

  // Handle gradient
  if (bgGradient) {
    const direction = bgGradientDirection || '180deg';
    if (bgGradientType === 'radial') {
      bg = `radial-gradient(${bgGradientColor2 || 'center'}, ${bgGradientColor1}, ${bgGradientColor2})`;
    } else {
      bg = `linear-gradient(${direction}, ${bgGradientColor1}, ${bgGradientColor2})`;
    }
    if (bgImage) {
      bg = `${bg}, url(${cleanUrl(bgImage)}) center / ${bgSize ?? 'cover'} no-repeat`;
    }
  }

  // ✅ BUILD containerStyle - start with base props, then merge responsive styles
  const containerStyle: React.CSSProperties = {
    // Base props (only if explicitly set)
    minHeight: minHeight || undefined,
    minWidth: minWidth || undefined,
    maxWidth: maxWidth || undefined,
    maxHeight: maxHeight || undefined,
    width: width || undefined,
    height: height || undefined,
    borderRadius: borderRadius || undefined,
    padding: padding || undefined,
    margin: margin || undefined,
    marginTop: marginTop || undefined,
    marginRight: marginRight || undefined,
    marginBottom: marginBottom || undefined,
    marginLeft: marginLeft || undefined,
    flexWrap: flexWrap as any || undefined,
    textAlign: textAlign as any || undefined,
    borderWidth: bw || undefined,
    borderColor: borderColor || undefined,
    borderStyle: borderStyle || (bw && bw !== '0px' ? 'solid' : undefined),
    background: bg || undefined,
    display: display || undefined,
    gap: gap || undefined,
    boxShadow: boxShadow || undefined,
    zIndex: zIndex ?? undefined,
    position: zIndex !== null && zIndex !== undefined ? 'relative' : undefined,
  };

  // ✅ Apply flexDirection: check responsive first (short-form key), then props
  // Note: mergeResponsiveStyles now returns short-form keys (flexDir, not flexDirection)
  containerStyle.flexDirection = (responsiveStyles.flexDir as any) || flexDirFromProps || flexDir || direction || undefined;

  // ✅ Apply justifyContent: check responsive first (short-form key), then props
  containerStyle.justifyContent = (responsiveStyles.justify as any) || justifyContentFromProps || justify || undefined;

  // ✅ Apply alignItems: check responsive first (short-form key), then props
  containerStyle.alignItems = (responsiveStyles.items as any) || alignItemsFromProps || items || align || undefined;

  // ✅ Merge all other responsive styles (padding, margin, gap, etc.)
  // This ensures responsive values override base props
  // Note: responsiveStyles now has short-form keys (pt, mt, etc.)
  // We need to convert them to camelCase for containerStyle using propMap
  Object.keys(responsiveStyles).forEach(key => {
    const value = responsiveStyles[key];
    if (value !== undefined && value !== '') {
      // Convert short-form to camelCase using propMap
      const mapping = propMap[key];
      if (mapping) {
        (containerStyle as any)[mapping.react] = value;
      } else {
        // If no mapping, use key as-is (already camelCase)
        (containerStyle as any)[key] = value;
      }
    }
  });

  // Handle tag and link
  const Tag = (tag === 'a' && linkUrl) ? 'a' : tag || 'div';
  const linkProps = (tag === 'a' && linkUrl) ? { href: linkUrl } : {};

  // ✅ Generate responsive styles as <style> tags for builder preview
  const responsiveStylesElement = generateResponsiveStyles(id, responsive);

  return (
    <>
      {/* Render responsive styles */}
      {responsiveStylesElement}
      
      <Tag
        id={id}
        data-node-id={id}
        style={containerStyle}
        className={`${dndClassName || ''} ${customClass || ''}`.trim()}
        {...linkProps}
      >
        {children}
      </Tag>
    </>
  );
};

// Image Component - SIMPLIFIED & ROBUST
export const ImageComponent: React.FC<any> = (props) => {
  const {
    src, alt, align, textAlign, caption, id, customClass, customId,
    boxShadow, zIndex, responsive, activeBreakpoint,
    title, linkUrl, linkTarget, linkType, lazyLoad,
    objectFit, objectPosition, borderRadius, borderWidth, borderColor, borderStyle,
    opacity, filterBlur, filterBrightness, filterContrast, filterGrayscale, filterSepia, filterHueRotate, filterSaturate,
    hoverFilterBlur, hoverFilterBrightness, hoverFilterGrayscale, hoverScale, hoverTranslateY,
    transitionDuration, transitionEasing,
    width, maxWidth, height, mt, mr, mb, ml
  } = props;

  const imageSrc = cleanUrl(src);
  // Use textAlign if available (responsive), fall back to align (legacy)
  const alignment = textAlign || align || undefined;
  const alignClass = alignment === 'center' ? 'items-center' : alignment === 'right' ? 'items-end' : (alignment ? 'items-start' : '');

  // Build filter string
  const filters = [];
  if (filterBlur) filters.push(`blur(${filterBlur})`);
  if (filterBrightness) filters.push(`brightness(${filterBrightness}%)`);
  if (filterContrast) filters.push(`contrast(${filterContrast}%)`);
  if (filterGrayscale) filters.push(`grayscale(${filterGrayscale}%)`);
  if (filterSepia) filters.push(`sepia(${filterSepia}%)`);
  if (filterHueRotate) filters.push(`hue-rotate(${filterHueRotate}deg)`);
  if (filterSaturate) filters.push(`saturate(${filterSaturate}%)`);
  const filterString = filters.length > 0 ? filters.join(' ') : undefined;

  // Build hover filter string
  const hoverFilters = [];
  if (hoverFilterBlur) hoverFilters.push(`blur(${hoverFilterBlur})`);
  if (hoverFilterBrightness) hoverFilters.push(`brightness(${hoverFilterBrightness}%)`);
  if (hoverFilterGrayscale) hoverFilters.push(`grayscale(${hoverFilterGrayscale}%)`);
  const hoverFilterString = hoverFilters.length > 0 ? hoverFilters.join(' ') : undefined;

  const hoverStyle = (hoverScale || hoverTranslateY || hoverFilterString) ? `
    #${id}:hover {
      transform: scale(${hoverScale || 1}) translateY(${hoverTranslateY || 0}px) !important;
      ${hoverFilterString ? `filter: ${hoverFilterString} !important;` : ''}
    }
  ` : '';

  const imageContent = (
    <img
      id={id}
      src={imageSrc || ''}
      alt={alt || ''}
      title={title || undefined}
      loading={lazyLoad ? 'lazy' : undefined}
      style={{
        borderRadius: borderRadius || undefined,
        boxShadow: boxShadow || undefined,
        zIndex: zIndex ?? undefined,
        position: (zIndex ?? null) !== null ? 'relative' : undefined,
        opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
        objectFit: objectFit || undefined,
        objectPosition: objectPosition || undefined,
        width: width || undefined,
        maxWidth: maxWidth || undefined,
        height: height || undefined,
        borderColor: borderColor || undefined,
        borderWidth: borderWidth || undefined,
        borderStyle: (borderWidth && borderWidth !== '0px') ? borderStyle || undefined : undefined,
        filter: filterString,
        ...(transitionDuration && transitionEasing ? { transition: `all ${transitionDuration} ${transitionEasing}` } : {}),
        marginTop: mt || undefined,
        marginRight: mr || undefined,
        marginBottom: mb || undefined,
        marginLeft: ml || undefined,
      }}
    />
  );

  return (
    <>
      {hoverStyle && <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />}
      <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
        {linkUrl && linkType !== 'none' ? (
          <a href={linkUrl} target={linkTarget || '_self'}>
            {imageContent}
          </a>
        ) : (
          imageContent
        )}
        {caption && <p className="text-xs text-slate-400 mt-2 italic">{caption}</p>}
      </div>
    </>
  );
};

// Divider Component
export const DividerComponent: React.FC<any> = (props) => {
  const {
    thickness, color, style: divStyle, padding, id, customClass, customId,
    dividerStyle, dividerColor, showMiddleContent, middleType, middleText, middleIconName,
    middleContentColor, middleContentSize, middleContentBg, middleContentPadding,
    opacity, responsive, activeBreakpoint, textAlign, mt, mb
  } = props;

  // Support both old and new prop names
  const lineStyle = dividerStyle || divStyle || undefined;
  const lineColor = dividerColor || color || undefined;
  const lineThickness = responsive?.[activeBreakpoint || 'md']?.dividerThickness || responsive?.md?.dividerThickness || (thickness ? `${thickness}px` : undefined);
  const lineWidth = responsive?.[activeBreakpoint || 'md']?.dividerWidth || responsive?.md?.dividerWidth || undefined;
  const alignment = textAlign || undefined;
  const marginTop = mt || undefined;
  const marginBottom = mb || undefined;

  const showMiddle = showMiddleContent && middleType !== 'none';

  return (
    <div id={customId || id} className={`${customClass || ''}`} style={{ paddingTop: padding || undefined, paddingBottom: padding || undefined, marginTop, marginBottom, opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined }}>
      <div style={{ textAlign: alignment as any }}>
        <hr style={{
          borderColor: lineColor,
          borderWidth: lineThickness,
          borderStyle: lineStyle,
          width: lineWidth,
          ...(lineWidth ? { margin: '0 auto' } : {}),
        }} />
      </div>
      {showMiddle && (
        <div style={{
          textAlign: alignment as any,
          marginTop: middleContentSize ? `-${middleContentSize}` : undefined,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            color: middleContentColor || undefined,
            fontSize: middleContentSize || undefined,
            background: middleContentBg || undefined,
            padding: middleContentPadding || undefined,
          }}>
            {middleType === 'text' ? middleText : (middleType === 'icon' && middleIconName ? middleIconName : '')}
          </span>
        </div>
      )}
    </div>
  );
};

// Spacer Component
export const SpacerComponent: React.FC<any> = (props) => {
  const { height, id, customClass, customId, responsive, opacity, bgColor, activeBreakpoint } = props;

  // Read spacerHeight from responsive props based on active breakpoint
  let spacerHeight = height || undefined;
  if (responsive) {
    const bp = activeBreakpoint || 'md';
    // Try active breakpoint first, then fall back to md
    const bpHeight = responsive[bp]?.spacerHeight;
    const mdHeight = responsive.md?.spacerHeight;
    spacerHeight = bpHeight || mdHeight || height || undefined;
  }

  return (
    <div
      id={customId || id}
      style={{
        height: spacerHeight,
        opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
        background: bgColor || undefined,
      }}
      className={customClass || ''}
      aria-label="Spacer"
    />
  );
};

// ============= NEW COMPONENTS =============

// ListItem Component
export const ListItemComponent: React.FC<any> = (props) => {
  const {
    text, icon, iconType, iconSize, iconColor, textColor, bgColor, borderRadius,
    borderWidth, borderColor, borderStyle, boxShadow, gap, padding,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  // Dynamically load lucide icon
  const [LucideIcon, setLucideIcon] = useState<any>(null);

  useEffect(() => {
    if (iconType === 'lucide' && icon) {
      import('lucide-react').then((module) => {
        const IconComponent = (module as any)[icon];
        setLucideIcon(IconComponent || null);
      });
    }
  }, [iconType, icon]);

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: gap || '8px',
          padding: padding || '8px',
          backgroundColor: bgColor || undefined,
          borderRadius: borderRadius || undefined,
          borderWidth: borderWidth || undefined,
          borderColor: borderColor || undefined,
          borderStyle: (borderWidth && borderWidth !== '0px') ? (borderStyle || 'solid') : 'none',
          boxShadow: boxShadow || undefined,
          color: textColor || '#000000',
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {icon && (
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {iconType === 'lucide' && LucideIcon && (
              <LucideIcon size={iconSize || '24px'} color={iconColor || undefined} />
            )}
            {iconType === 'image' && (
              <img src={icon} alt="" style={{ width: iconSize || '24px', height: iconSize || '24px' }} />
            )}
          </span>
        )}
        <span>{text || 'List item text'}</span>
      </div>
    </>
  );
};

// IconElement Component
export const IconElementComponent: React.FC<any> = (props) => {
  const {
    source, icon, reactIcon, imageUrl, iconSize, iconColor, bgColor, borderRadius,
    padding, boxShadow, linkUrl,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  // Dynamically load lucide icon
  const [LucideIcon, setLucideIcon] = useState<any>(null);

  useEffect(() => {
    if (source === 'lucide' && icon) {
      import('lucide-react').then((module) => {
        const IconComponent = (module as any)[icon];
        setLucideIcon(IconComponent || null);
      });
    }
  }, [source, icon]);

  const iconContent = () => {
    if (source === 'lucide' && LucideIcon) {
      return <LucideIcon size={iconSize || '32px'} color={iconColor || undefined} />;
    }
    if (source === 'react' && reactIcon) {
      return <span>{reactIcon}</span>;
    }
    if (source === 'image' && imageUrl) {
      return <img src={imageUrl} alt="" style={{ width: iconSize || '32px', height: iconSize || '32px' }} />;
    }
    return null;
  };

  const wrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor || undefined,
    borderRadius: borderRadius || undefined,
    padding: padding || '8px',
    boxShadow: boxShadow || undefined,
    opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
    paddingTop: pt || undefined,
    paddingRight: pr || undefined,
    paddingBottom: pb || undefined,
    paddingLeft: pl || undefined,
    marginTop: mt || undefined,
    marginRight: mr || undefined,
    marginBottom: mb || undefined,
    marginLeft: ml || undefined,
    ...responsiveStyles,
  };

  const content = (
    <span
      id={customId || id}
      style={wrapperStyle}
      className={customClass || ''}
    >
      {iconContent()}
    </span>
  );

  if (linkUrl) {
    return (
      <>
        {generateResponsiveStyles(id, responsive)}
        <a href={linkUrl} style={{ textDecoration: 'none' }}>
          {content}
        </a>
      </>
    );
  }

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      {content}
    </>
  );
};

// NestedTimeline Component
export const NestedTimelineComponent: React.FC<any> = (props) => {
  const {
    phases, bgColor, padding, lineWidth, lineColor, milestoneSize, milestoneBorderColor,
    milestoneColor, phaseIconSize, phaseIconColor, phaseTitleSize, phaseTitleColor,
    phaseDescSize, phaseDescColor, subStepsIconSize, subStepsIconColor, connectorDotSize,
    connectorDotBorder, stepTitleSize, stepTitleColor, stepDescSize, stepDescColor,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  let parsedPhases = [];
  try {
    parsedPhases = typeof phases === 'string' ? JSON.parse(phases) : (phases || []);
  } catch (e) {
    parsedPhases = [];
  }

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          backgroundColor: bgColor || undefined,
          padding: padding || '64px 16px',
          position: 'relative',
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {parsedPhases.map((phase: any, index: number) => (
          <div key={phase.id || index} style={{ marginBottom: '40px', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: lineWidth || '1px',
              backgroundColor: lineColor || '#fca5a5',
              transform: 'translateX(-50%)',
            }} />
            
            {/* Milestone circle */}
            <div style={{
              width: milestoneSize || '80px',
              height: milestoneSize || '80px',
              borderRadius: '50%',
              backgroundColor: milestoneColor || '#f87171',
              border: `2px solid ${milestoneBorderColor || '#fca5a5'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              position: 'relative',
              zIndex: 1,
              fontSize: phaseIconSize || '64px',
              color: phaseIconColor || '#334155',
            }}>
              {phase.number || (index + 1)}
            </div>

            {/* Phase content */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: phaseTitleSize || '36px',
                color: phaseTitleColor || '#1e293b',
                margin: '0 0 10px',
              }}>
                {phase.title || ''}
              </h3>
              <p style={{
                fontSize: phaseDescSize || '18px',
                color: phaseDescColor || '#64748b',
                margin: 0,
              }}>
                {phase.content || ''}
              </p>
            </div>

            {/* Sub steps */}
            {phase.subSteps && phase.subSteps.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                {phase.subSteps.map((step: any, stepIndex: number) => (
                  <div key={stepIndex} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    position: 'relative',
                  }}>
                    {/* Connector dot */}
                    <div style={{
                      width: connectorDotSize || '20px',
                      height: connectorDotSize || '20px',
                      borderRadius: '50%',
                      border: `2px solid ${connectorDotBorder || '#fca5a5'}`,
                      backgroundColor: 'white',
                      flexShrink: 0,
                      marginRight: '12px',
                      marginTop: '4px',
                    }} />
                    <div>
                      <h4 style={{
                        fontSize: stepTitleSize || '16px',
                        color: stepTitleColor || '#f87171',
                        margin: '0 0 4px',
                      }}>
                        {step.title || ''}
                      </h4>
                      <p style={{
                        fontSize: stepDescSize || '17px',
                        color: stepDescColor || '#64748b',
                        margin: 0,
                      }}>
                        {step.description || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

// ImageBox Component
export const ImageBoxComponent: React.FC<any> = (props) => {
  const {
    image, title, text, titleLevel, textColor, imageWidth, flexDir, gap,
    bgColor, borderRadius, borderWidth, borderColor, borderStyle, boxShadow, padding,
    id, customClass, customId, responsive, activeBreakpoint,
    fontSize, lineHeight,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  const TitleTag = `h${titleLevel || '4'}` as keyof JSX.IntrinsicElements;

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          display: 'flex',
          flexDirection: (flexDir as any) || 'row',
          gap: gap || '12px',
          backgroundColor: bgColor || undefined,
          borderRadius: borderRadius || undefined,
          borderWidth: borderWidth || undefined,
          borderColor: borderColor || undefined,
          borderStyle: (borderWidth && borderWidth !== '0px') ? (borderStyle || 'solid') : 'none',
          boxShadow: boxShadow || undefined,
          padding: padding || '16px',
          color: textColor || '#000000',
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {image && (
          <img
            src={image}
            alt={title || 'Image Box'}
            style={{ width: imageWidth || '120px', height: 'auto', objectFit: 'cover' }}
          />
        )}
        <div>
          <TitleTag style={{
            fontSize: fontSize || undefined,
            lineHeight: lineHeight || undefined,
            margin: '0 0 8px',
          }}>
            {title || 'Image Box Title'}
          </TitleTag>
          <p style={{ margin: 0 }}>{text || 'Description text here'}</p>
        </div>
      </div>
    </>
  );
};

// AccordionItem Component
export const AccordionItemComponent: React.FC<any> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    title, text, icon, iconSize, iconColor, iconWidth, iconHeight,
    titleBgColor, titleTextColor, titlePadding, contentBgColor, contentTextColor,
    padding, borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth,
    borderColor, borderRadius, width, height, textAlign, boxShadow,
    id, customClass, customId, responsive, activeBreakpoint,
    fontSize, lineHeight,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  // Dynamically load lucide icon
  const [LucideIcon, setLucideIcon] = useState<any>(null);

  useEffect(() => {
    if (icon) {
      import('lucide-react').then((module) => {
        const IconComponent = (module as any)[icon];
        setLucideIcon(IconComponent || null);
      });
    }
  }, [icon]);

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          width: width || undefined,
          height: height || undefined,
          borderRadius: borderRadius || undefined,
          borderTopWidth: borderTopWidth || undefined,
          borderRightWidth: borderRightWidth || undefined,
          borderBottomWidth: borderBottomWidth || undefined,
          borderLeftWidth: borderLeftWidth || undefined,
          borderColor: borderColor || undefined,
          borderStyle: 'solid',
          overflow: 'hidden',
          boxShadow: boxShadow || undefined,
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {/* Accordion Header */}
        <div
          style={{
            backgroundColor: titleBgColor || '#f8fafc',
            color: titleTextColor || '#1e293b',
            padding: titlePadding || '12px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: textAlign as any || undefined,
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {LucideIcon && (
              <LucideIcon size={iconSize || '16px'} color={iconColor || undefined} />
            )}
            <span>{title || 'Accordion Title'}</span>
          </span>
          <span style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>

        {/* Accordion Content */}
        {isOpen && (
          <div
            style={{
              backgroundColor: contentBgColor || '#ffffff',
              color: contentTextColor || '#334155',
              padding: padding || '16px',
              textAlign: textAlign as any || undefined,
              fontSize: fontSize || undefined,
              lineHeight: lineHeight || undefined,
            }}
          >
            {text || 'Accordion content goes here'}
          </div>
        )}
      </div>
    </>
  );
};

// Widget Component
export const WidgetComponent: React.FC<any> = (props) => {
  const {
    widgetName,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {widgetName ? (
          <div>Widget: {widgetName}</div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No widget selected
          </div>
        )}
      </div>
    </>
  );
};

// Counter Component
export const CounterComponent: React.FC<any> = (props) => {
  const {
    value, prefix, suffix, duration, numberColor, bgColor, padding, textAlign,
    id, customClass, customId, responsive, activeBreakpoint,
    fontSize, fontWeight,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(value) || 1000;
    const durationMs = (duration || 2) * 1000;
    const step = target / (durationMs / 16); // ~60fps
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          backgroundColor: bgColor || undefined,
          padding: padding || '16px',
          textAlign: (textAlign as any) || 'center',
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        <span style={{
          color: numberColor || '#000000',
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
        }}>
          {prefix || ''}{count}{suffix || ''}
        </span>
      </div>
    </>
  );
};

// Menu Component
export const MenuComponent: React.FC<any> = (props) => {
  const {
    menuId, bgColor, textColor, hoverColor, align, menuDirection, gap,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <nav
        id={customId || id}
        style={{
          backgroundColor: bgColor || undefined,
          textAlign: (align as any) || undefined,
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {menuId ? (
          <div style={{
            display: 'flex',
            flexDirection: (menuDirection === 'vertical' ? 'column' : 'row') as any,
            gap: gap || '24px',
            justifyContent: (align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start') as any,
            color: textColor || '#000000',
          }}>
            <div style={{ padding: '8px 0' }}>Menu: {menuId}</div>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No menu selected
          </div>
        )}
      </nav>
    </>
  );
};

// Tabs Component
export const TabsComponent: React.FC<any> = (props) => {
  const [activeTab, setActiveTab] = useState(props.activeTab || 0);

  const {
    tabs, tabBgColor, tabTextColor, activeTabBgColor, activeTabTextColor,
    contentBgColor, borderColor, borderRadius,
    id, customClass, customId, responsive, activeBreakpoint,
    pt, pr, pb, pl, mt, mr, mb, ml, opacity
  } = props;

  const responsiveStyles = mergeResponsiveStyles(responsive || {}, activeBreakpoint || 'md');

  let parsedTabs = [];
  try {
    parsedTabs = typeof tabs === 'string' ? JSON.parse(tabs) : (tabs || []);
  } catch (e) {
    parsedTabs = [];
  }

  return (
    <>
      {generateResponsiveStyles(id, responsive)}
      <div
        id={customId || id}
        style={{
          borderRadius: borderRadius || '8px',
          border: `1px solid ${borderColor || '#e2e8f0'}`,
          overflow: 'hidden',
          opacity: (opacity !== undefined && opacity !== null) ? (opacity <= 1 ? opacity : opacity / 100) : undefined,
          paddingTop: pt || undefined,
          paddingRight: pr || undefined,
          paddingBottom: pb || undefined,
          paddingLeft: pl || undefined,
          marginTop: mt || undefined,
          marginRight: mr || undefined,
          marginBottom: mb || undefined,
          marginLeft: ml || undefined,
          ...responsiveStyles,
        }}
        className={customClass || ''}
      >
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          backgroundColor: tabBgColor || '#f8fafc',
          borderBottom: `1px solid ${borderColor || '#e2e8f0'}`,
        }}>
          {parsedTabs.map((tab: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === index ? (activeTabBgColor || '#ffffff') : 'transparent',
                color: activeTab === index ? (activeTabTextColor || '#1e293b') : (tabTextColor || '#64748b'),
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTab === index ? '600' : '400',
                borderBottom: activeTab === index ? `2px solid ${activeTabTextColor || '#1e293b'}` : '2px solid transparent',
              }}
            >
              {tab.title || `Tab ${index + 1}`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: contentBgColor || '#ffffff',
          padding: '20px',
        }}>
          {parsedTabs[activeTab] && (
            <div>{parsedTabs[activeTab].content || 'No content available'}</div>
          )}
        </div>
      </div>
    </>
  );
};

// ============= EXPORT INDIVIDUAL ELEMENTS (UPDATED) =============

export const ListItemElement = elementDefinitions.listItem;
export const IconElement = elementDefinitions.iconElement;
export const NestedTimelineElement = elementDefinitions.nestedTimeline;
export const ImageBoxElement = elementDefinitions.imageBox;
export const AccordionItemElement = elementDefinitions.accordionItem;
export const WidgetElement = elementDefinitions.widget;
export const CounterElement = elementDefinitions.counter;
export const MenuElement = elementDefinitions.menu;
export const TabsElement = elementDefinitions.tabs;
