import React, { useRef } from 'react';
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
  customClass: '',
  customId: '',
  boxShadow: '',
  zIndex: 0,
  responsive: {}
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

// (Component definitions moved to before this section - see end of file)
// Using lazy references to avoid circular dependency issues

export const elementDefinitions: Record<string, any> = {
  heading: {
    type: 'heading',
    label: 'Heading',
    icon: Type,
    category: 'basic',
    defaults: {
      ...defaultResponsiveProps,
      text: '<h2>Heading Text</h2>',
      level: 'h2',
      align: 'left',
      color: '#000000',
      bgColor: '',
      bgImage: '',
      bgSize: 'cover',
      minHeight: '',
      borderRadius: '',
      borderWidth: '0px',
      borderColor: '#e2e8f0',
      borderStyle: 'none',
      opacity: 1,
      width: '',
      height: '',
      textDecoration: 'none',
      fontSize: '',
      fontWeight: '',
      textTransform: 'none',
      letterSpacing: '',
      wordSpacing: '',
      lineHeight: '',
    },
    controls: [
      { key: 'text', label: 'Content', type: 'richtext' },
      { key: 'level', label: 'Heading Level', type: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
      { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'bgImage', label: 'Background Image URL', type: 'image-url' },
      { key: 'bgSize', label: 'BG Size', type: 'select', options: ['cover', 'contain', 'auto'] },
      { key: 'minHeight', label: 'Min Height', type: 'text' },
      { key: 'borderRadius', label: 'Border Radius', type: 'text' },
      { key: 'borderWidth', label: 'Border Width', type: 'text' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
      { key: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.1 },
      { key: 'width', label: 'Width', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'textDecoration', label: 'Text Decoration', type: 'select', options: ['none', 'underline', 'line-through'] },
      ...createTypographyFields(),
      ...commonAdvancedFields,
    ],
    get component() { return HeadingComponent; },
  },
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    icon: AlignLeft,
    category: 'basic',
    defaults: {
      ...defaultResponsiveProps,
      html: '<p>Enter your text here...</p>',
      align: 'left',
      color: '#333333',
      textDecoration: 'none',
      opacity: 1,
      minHeight: '',
      fontSize: '',
      fontWeight: '',
      textTransform: 'none',
      letterSpacing: '',
      wordSpacing: '',
      lineHeight: '',
    },
    controls: [
      { key: 'html', label: 'Content', type: 'richtext' },
      { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right', 'justify'] },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'textDecoration', label: 'Text Decoration', type: 'select', options: ['none', 'underline', 'line-through'] },
      { key: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.1 },
      { key: 'minHeight', label: 'Min Height', type: 'text' },
      ...createTypographyFields(),
      ...commonAdvancedFields,
    ],
    get component() { return TextComponent; },
  },
  button: {
    type: 'button',
    label: 'Button',
    icon: MousePointerClick,
    category: 'basic',
    defaults: {
      ...defaultResponsiveProps,
      text: 'Click Me',
      url: '#',
      bgColor: '#3b82f6',
      textColor: '#ffffff',
      borderRadius: '',
      borderWidth: '',
      borderColor: '',
      borderStyle: 'solid',
      size: 'md',
      align: 'left',
      padding: '',
      icon: '',
      iconPos: 'left',
      iconSize: '18',
      iconColor: '',
      hoverBg: '',
      hoverColor: '',
      hoverBorderColor: '',
      hoverBorderWidth: '',
      hoverBorderStyle: '',
      hoverScale: 1,
    },
    controls: [
      { key: 'text', label: 'Label', type: 'text' },
      { key: 'url', label: 'Link URL', type: 'text' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'borderRadius', label: 'Border Radius', type: 'text' },
      { key: 'borderWidth', label: 'Border Width', type: 'text' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['solid', 'dashed', 'dotted', 'none'] },
      { key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'padding', label: 'Padding', type: 'text' },
      { key: 'icon', label: 'Icon Name', type: 'text' },
      { key: 'iconPos', label: 'Icon Position', type: 'select', options: ['left', 'right'] },
      { key: 'iconSize', label: 'Icon Size', type: 'text' },
      { key: 'iconColor', label: 'Icon Color', type: 'color' },
      { key: 'hoverBg', label: 'Hover Background', type: 'color' },
      { key: 'hoverColor', label: 'Hover Text Color', type: 'color' },
      { key: 'hoverBorderColor', label: 'Hover Border Color', type: 'color' },
      { key: 'hoverBorderWidth', label: 'Hover Border Width', type: 'text' },
      { key: 'hoverBorderStyle', label: 'Hover Border Style', type: 'select', options: ['solid', 'dashed', 'dotted', 'none'] },
      { key: 'hoverScale', label: 'Hover Scale', type: 'number' },
      ...commonAdvancedFields,
    ],
    get component() { return ButtonComponent; },
  },
  container: {
    type: 'container',
    label: 'Container',
    icon: Box,
    category: 'layout',
    defaults: {
      ...defaultResponsiveProps,
      bgColor: '',
      bgImage: '',
      bgSize: 'cover',
      width: '',
      height: '',
      minWidth: '',
      minHeight: '',
      maxWidth: '',
      maxHeight: '',
      borderRadius: '',
      borderWidth: '',
      borderColor: '',
      borderStyle: '',
      padding: '',
      direction: '',
      align: '',
      items: '',
      justify: '',
      gap: '',
      flexWrap: '',
      textAlign: '',
      display: '',
      flexDir: '',
      bgGradient: false,
      bgGradientDirection: '180deg',
      bgGradientType: 'linear',
      bgGradientColor1: '',
      bgGradientColor2: '',
      bgGradientPosition: 'center',
      tag: 'div',
      linkUrl: '',
    },
    controls: [
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'bgImage', label: 'Background Image URL', type: 'image-url' },
      { key: 'bgSize', label: 'BG Size', type: 'select', options: ['cover', 'contain', 'auto'] },
      { key: 'bgGradient', label: 'Use Gradient', type: 'toggle' },
      { key: 'bgGradientType', label: 'Gradient Type', type: 'select', options: ['linear', 'radial'] },
      { key: 'bgGradientDirection', label: 'Gradient Direction', type: 'text' },
      { key: 'bgGradientColor1', label: 'Gradient Color 1', type: 'color' },
      { key: 'bgGradientColor2', label: 'Gradient Color 2', type: 'color' },
      { key: 'width', label: 'Width', type: 'text', responsiveOnly: true },
      { key: 'height', label: 'Height', type: 'text', responsiveOnly: true },
      { key: 'minWidth', label: 'Min Width', type: 'text', responsiveOnly: true },
      { key: 'minHeight', label: 'Min Height', type: 'text', responsiveOnly: true },
      { key: 'maxWidth', label: 'Max Width', type: 'text', responsiveOnly: true },
      { key: 'maxHeight', label: 'Max Height', type: 'text', responsiveOnly: true },
      { key: 'borderRadius', label: 'Border Radius', type: 'text', responsiveOnly: true },
      { key: 'borderWidth', label: 'Border Width', type: 'text', responsiveOnly: true },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
      { key: 'padding', label: 'Padding', type: 'text', responsiveOnly: true },
      { key: 'direction', label: 'Direction (legacy)', type: 'select', options: ['row', 'column'] },
      { key: 'flexDir', label: 'Flex Direction', type: 'text', responsiveOnly: true },
      { key: 'align', label: 'Align Items (legacy)', type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'], responsiveOnly: true },
      { key: 'items', label: 'Align Items', type: 'text', responsiveOnly: true },
      { key: 'justify', label: 'Justify Content', type: 'text', responsiveOnly: true },
      { key: 'gap', label: 'Gap', type: 'text', responsiveOnly: true },
      {
        key: "flexWrap",
        label: "Flex Wrap",
        type: "select",
        responsiveOnly: true,
        options: [
          { label: "Default (nowrap)", value: "" },
          { label: "No Wrap", value: "nowrap" },
          { label: "Wrap", value: "wrap" },
          { label: "Wrap Reverse", value: "wrap-reverse" }
        ]
      },
      { key: 'textAlign', label: 'Text Align', type: 'text', responsiveOnly: true },
      { key: 'display', label: 'Display', type: 'text', responsiveOnly: true },
      { key: 'tag', label: 'HTML Tag', type: 'text' },
      { key: 'linkUrl', label: 'Link URL (if tag=a)', type: 'text' },
      ...commonAdvancedFields,
    ],
    get component() { return ContainerComponent; },
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: Image,
    category: 'media',
    defaults: {
      ...defaultResponsiveProps,
      src: '',
      alt: '',
      align: 'left',
      borderRadius: '',
      caption: '',
    },
    controls: [
      { key: 'src', label: 'Image URL', type: 'image-url' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'borderRadius', label: 'Border Radius', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
      ...commonAdvancedFields,
    ],
    get component() { return ImageComponent; },
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'basic',
    defaults: {
      ...defaultResponsiveProps,
      thickness: 1,
      color: '#e5e7eb',
      style: 'solid',
      padding: '',
    },
    controls: [
      { key: 'thickness', label: 'Thickness', type: 'number' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'style', label: 'Style', type: 'select', options: ['solid', 'dashed', 'dotted'] },
      { key: 'padding', label: 'Padding', type: 'text' },
      ...commonAdvancedFields,
    ],
    get component() { return DividerComponent; },
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    icon: MoveVertical,
    category: 'basic',
    defaults: {
      ...defaultResponsiveProps,
      height: 40,
    },
    controls: [
      { key: 'height', label: 'Height (px)', type: 'number' },
      ...commonAdvancedFields,
    ],
    get component() { return SpacerComponent; },
  },
};

// ============= ELEMENT FACTORY FUNCTIONS =============

export const createElementNode = (elementType: string) => {
  const node = {
    id: `block-${elementType}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: elementType,
    props: {
      ...elementDefinitions[elementType].defaults
    }
  };
  if (elementType === 'container' || elementType === 'tabs') {
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

export const cssPropertyMap = {
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  textAlign: 'textAlign',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
  display: 'display',
  flexDir: 'flexDirection',
  flexWrap: 'flexWrap',
  gap: 'gap',
  items: 'alignItems',
  justify: 'justifyContent',
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
  rounded: 'borderRadius',
  borderRadius: 'borderRadius',
  overflow: 'overflow',
  textTransform: 'textTransform',
  wordSpacing: 'wordSpacing',
  menuTextTransform: 'textTransform',
  textAlignProp: 'textAlign',
  boxShadow: 'boxShadow',
  zIndex: 'zIndex'
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
        const cssProp = cssPropertyMap[propKey] || propKey;
        mergedStyles[cssProp] = propValue;
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
    text, content, level, align, color, bgColor, bgImage, bgSize,
    minHeight, borderRadius, borderWidth, borderColor, borderStyle,
    opacity, width, height, textDecoration, fontSize, fontWeight,
    textTransform, letterSpacing, wordSpacing, lineHeight,
    id, customClass, customId, boxShadow, zIndex, responsive
  } = props;

  // Normalize heading level
  const getTag = (levelProp: any): string => {
    if (!levelProp) return 'h2';
    const str = levelProp.toString();
    if (str.startsWith('h')) return str;
    if (str.startsWith('heading-')) return `h${str.replace('heading-', '')}`;
    return `h${str}`;
  };
  
  const Tag = getTag(level) as keyof JSX.IntrinsicElements;
  const htmlContent = text || content || 'Heading Text';
  
  // Sizes
  const sizes: Record<string, string> = { '1': 'text-5xl', '2': 'text-3xl', '3': 'text-2xl', '4': 'text-xl' };
  const levelNum = (level || '2').toString().replace('h', '').replace('heading-', '');
  
  // Background
  let bg = bgColor || undefined;
  if (bgImage) {
    bg = `url(${cleanUrl(bgImage)}) center / ${bgSize || 'cover'} no-repeat`;
  }
  
  const alignClass = getTextAlignmentClass(align);

  return (
    <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
      <Tag
        id={id}
        className={`font-black ${(!fontSize) ? (sizes[levelNum] || 'text-3xl') : ''}`}
        style={{
          color: color || '#000000',
          textDecoration: textDecoration || 'none',
          opacity: opacity ?? 1,
          width: width || undefined,
          height: height || undefined,
          background: bg,
          minHeight: minHeight || undefined,
          borderRadius: borderRadius || undefined,
          borderColor: borderColor || undefined,
          borderWidth: borderWidth || undefined,
          borderStyle: (borderWidth && borderWidth !== '0px') ? 'solid' : 'none',
          textAlign: align as any || undefined,
          boxShadow: boxShadow || undefined,
          zIndex: zIndex || undefined,
          position: (zIndex || zIndex === 0) ? 'relative' : undefined,
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
          textTransform: (textTransform && textTransform !== 'none') ? textTransform : undefined,
          letterSpacing: (letterSpacing && letterSpacing !== 'normal') ? letterSpacing : undefined,
          wordSpacing: (wordSpacing && wordSpacing !== 'normal') ? wordSpacing : undefined,
          lineHeight: (lineHeight && lineHeight !== 'normal') ? lineHeight : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// Text Component (Paragraph) - SIMPLIFIED & ROBUST
export const TextComponent: React.FC<any> = (props) => {
  const {
    html, content, align, color, textDecoration, opacity, minHeight,
    fontSize, fontWeight, textTransform, letterSpacing, wordSpacing, lineHeight,
    id, customClass, customId, boxShadow, zIndex, responsive
  } = props;

  const htmlContent = html || content || '<p>Enter your text here...</p>';
  const alignClass = getTextAlignmentClass(align);

  return (
    <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
      <div 
        id={id}
        className="prose max-w-none leading-relaxed"
        style={{
          color: color || '#333333',
          textDecoration: textDecoration || 'none',
          opacity: opacity ?? 1,
          minHeight: minHeight || undefined,
          boxShadow: boxShadow || undefined,
          textAlign: align as any || undefined,
          zIndex: zIndex || undefined,
          position: (zIndex || zIndex === 0) ? 'relative' : undefined,
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
          textTransform: (textTransform && textTransform !== 'none') ? textTransform : undefined,
          letterSpacing: (letterSpacing && letterSpacing !== 'normal') ? letterSpacing : undefined,
          wordSpacing: (wordSpacing && wordSpacing !== 'normal') ? wordSpacing : undefined,
          lineHeight: (lineHeight && lineHeight !== 'normal') ? lineHeight : undefined,
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

// Button Component - SIMPLIFIED & ROBUST
export const ButtonComponent: React.FC<any> = (props) => {
  const {
    text, label, url, href, bgColor, textColor, borderRadius, borderWidth, borderColor, borderStyle,
    size, align, padding, icon, iconPos, iconSize, iconColor, 
    hoverBg, hoverColor, hoverBorderColor, hoverBorderWidth, hoverBorderStyle, hoverScale,
    id, customClass, customId, boxShadow, zIndex, responsive
  } = props;

  const Icon = icon ? (require('lucide-react') as any)[icon] : null;
  
  const sizeMap: Record<string, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-8 py-4 text-sm',
    lg: 'px-10 py-5 text-base',
  };
  
  const alignClass = getTextAlignmentClass(align);
  
  const hoverStyle = `
    #${id}:hover {
      background-color: ${hoverBg || bgColor || 'initial'} !important;
      color: ${hoverColor || textColor || 'initial'} !important;
      border-color: ${hoverBorderColor || borderColor || 'initial'} !important;
      border-width: ${hoverBorderWidth || borderWidth || 'initial'} !important;
      border-style: ${hoverBorderStyle || borderStyle || 'solid'} !important;
      transform: scale(${hoverScale || 1}) !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />
      <div id={customId || `${id}-wrap`} className={`${alignClass} ${customClass || ''}`}>
        <a
          id={id}
          href={url || href || '#'}
          className={`inline-flex items-center gap-2 font-bold transition-all duration-200 ${sizeMap[size || 'md']} rounded-xl`}
          style={{
            backgroundColor: bgColor || '#3b82f6',
            borderRadius: borderRadius || undefined,
            color: textColor || '#ffffff',
            borderWidth: borderWidth || undefined,
            borderStyle: borderStyle || 'solid',
            borderColor: borderColor || undefined,
            padding: padding || undefined,
            justifyContent: 'center',
            boxShadow: boxShadow || undefined,
            zIndex: zIndex || undefined,
            position: (zIndex || zIndex === 0) ? 'relative' : undefined,
          }}
        >
          {icon && iconPos !== 'right' && Icon && <Icon size={parseInt(iconSize) || 18} color={iconColor || textColor || '#ffffff'} />}
          {text || label || 'Click Me'}
          {icon && iconPos === 'right' && Icon && <Icon size={parseInt(iconSize) || 18} color={iconColor || textColor || '#ffffff'} />}
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
  let bg = bgColor || 'transparent';
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
    zIndex: zIndex || undefined,
    position: (zIndex || zIndex === 0) ? 'relative' : undefined,
  };

  // ✅ Apply flexDirection: check responsive first, then props
  containerStyle.flexDirection = (responsiveStyles.flexDirection as any) || flexDirFromProps || flexDir || direction || undefined;

  // ✅ Apply justifyContent: check responsive first, then props
  containerStyle.justifyContent = (responsiveStyles.justifyContent as any) || justifyContentFromProps || justify || undefined;

  // ✅ Apply alignItems: check responsive first, then props
  containerStyle.alignItems = (responsiveStyles.alignItems as any) || alignItemsFromProps || items || align || undefined;

  // ✅ Merge all other responsive styles (padding, margin, gap, etc.)
  // This ensures responsive values override base props
  Object.keys(responsiveStyles).forEach(key => {
    const value = responsiveStyles[key];
    if (value !== undefined && value !== '') {
      (containerStyle as any)[key] = value;
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
    src, alt, align, caption, id, customClass, customId, 
    boxShadow, zIndex, responsive
  } = props;

  const imageSrc = cleanUrl(src);
  const alignClass = align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';

  return (
    <div id={customId || `${id}-wrap`} className={`flex flex-col ${alignClass} ${customClass || ''}`}>
      <img 
        id={id}
        src={imageSrc || ''} 
        alt={alt || ''} 
        className="object-cover"
        style={{
          borderRadius: undefined,
          boxShadow: boxShadow || undefined,
          zIndex: zIndex || undefined,
          position: (zIndex || zIndex === 0) ? 'relative' : undefined,
        }}
      />
      {caption && <p className="text-xs text-slate-400 mt-2 italic">{caption}</p>}
    </div>
  );
};

// Divider Component
export const DividerComponent: React.FC<any> = (props) => {
  const { thickness, color, style: divStyle, padding, id, customClass, customId } = props;
  return (
    <div id={customId || id} className={`${customClass || ''}`} style={{ paddingTop: padding, paddingBottom: padding }}>
      <hr style={{ borderColor: color || '#e5e7eb', borderWidth: thickness || '1px', borderStyle: divStyle || 'solid' }} />
    </div>
  );
};

// Spacer Component
export const SpacerComponent: React.FC<any> = (props) => {
  const { height, id, customClass, customId } = props;
  return (
    <div 
      id={customId || id} 
      style={{ height: height || 40 }} 
      className={customClass || ''}
      aria-label="Spacer"
    />
  );
};
