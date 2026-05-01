/**
 * Block Types for Page Builder
 * Defines the available block types and their configurations
 */

import * as LucideIcons from 'lucide-react';
import { WIDGET_OPTIONS } from '../../../../widgets';

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg';

export const BREAKPOINTS: { key: Breakpoint; label: string; prefix: string; icon: any; width: string; minWidth: number; maxWidth: number | null }[] = [
  { key: 'base', label: 'Mobile',  prefix: '',     icon: 'Smartphone', width: '375px',  minWidth: 0,    maxWidth: 767   },
  { key: 'sm',   label: 'Tablet',  prefix: 'sm:',  icon: 'Tablet',     width: '768px',  minWidth: 768,  maxWidth: 1023 },
  { key: 'md',   label: 'Desktop', prefix: 'md:',  icon: 'Monitor',    width: '100%',   minWidth: 1024, maxWidth: null },
];

export type BlockType =
  | 'container'
  | 'hero' | 'heading' | 'paragraph' | 'image'
  | 'button' | 'divider' | 'spacer'
  | 'card' | 'cta' | 'columns' | 'stats'
  | 'listItem' | 'imageBox'
  | 'accordionItem' | 'widget';

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children?: Block[];
}

type FieldBase = { key: string; label: string };
export type Field =
  | (FieldBase & { type: 'text'; multiline?: boolean; placeholder?: string })
  | (FieldBase & { type: 'richtext' })
  | (FieldBase & { type: 'color' })
  | (FieldBase & { type: 'number'; min?: number; max?: number; step?: number })
  | (FieldBase & { type: 'boolean' })
  | (FieldBase & { type: 'url'; placeholder?: string })
  | (FieldBase & { type: 'responsive' })
  | (FieldBase & { type: 'separator' })
  | (FieldBase & { type: 'select'; options: { label: string; value: string | number }[] });

export interface BlockDef {
  label: string;
  description: string;
  category: 'layout' | 'content' | 'media' | 'actions';
  emoji: string;
  defaults: Record<string, any>;
  fields: Field[];
}

const COMMON_DEFAULTS = { customClass: '', customId: '', boxShadow: '', customCss: '', zIndex: 0, responsive: {} };
const COMMON_FIELDS: Field[] = [
  { key: 'sep_sizing', label: 'Layering & Depth', type: 'separator' },
  { key: 'zIndex', label: 'Z-Index Layer', type: 'number', min: -100, max: 9999, step: 1 },
  { key: 'boxShadow', label: 'Box Shadow', type: 'text', placeholder: '0 4px 12px rgba(0,0,0,0.1)' },
  { key: 'sep_common', label: 'Advanced Identity', type: 'separator' },
  { key: 'customClass', label: 'Custom CSS Class', type: 'text', placeholder: 'my-element-class' },
  { key: 'customId', label: 'Custom HTML ID', type: 'text', placeholder: 'my-element-id' },
  { key: 'customCss', label: 'Custom CSS', type: 'text', multiline: true, placeholder: '#block-ID { color: red; }' },
  { key: 'responsive', label: 'Responsive Styles', type: 'responsive' },
];

const TYPO_DEFAULTS = {
  fontSize: '', fontWeight: '', textTransform: 'none', textDecoration: 'none',
  letterSpacing: '', wordSpacing: '', lineHeight: ''
};
const TYPO_FIELDS = (prefix: string = ''): Field[] => [
  { key: prefix + 'fontSize', label: 'Font Size', type: 'text', placeholder: '24px, 1.5rem' },
  { key: prefix + 'fontWeight', label: 'Font Weight', type: 'select', options: [
    { label: 'Default', value: '' }, { label: '100', value: '100' }, { label: '200', value: '200' },
    { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' },
    { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }
  ]},
  { key: prefix + 'textTransform', label: 'Text Transform', type: 'select', options: [
    { label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }
  ]},
  { key: prefix + 'textDecoration', label: 'Text Decoration', type: 'select', options: [
    { label: 'None', value: 'none' }, { label: 'Underline', value: 'underline' }, { label: 'Line Through', value: 'line-through' }, { label: 'Overline', value: 'overline' }
  ]},
  { key: prefix + 'letterSpacing', label: 'Letter Spacing', type: 'text', placeholder: '0.1em, 2px' },
  { key: prefix + 'wordSpacing', label: 'Word Spacing', type: 'text', placeholder: '0.2em, 5px' },
  { key: prefix + 'lineHeight', label: 'Line Height', type: 'text', placeholder: '1.5, 24px' },
];

export const BLOCK_CATALOG: Record<BlockType, BlockDef> = {
  container: {
    label: 'Container', description: 'Flex/grid wrapper — add any blocks inside',
    category: 'layout', emoji: '⬜',
    defaults: {
      bgColor: 'transparent', bgImage: '', bgSize: 'cover', width: '', height: '',
      minWidth: '', minHeight: '', maxWidth: '', maxHeight: '', borderRadius: '',
      borderWidth: '0px', borderColor: '#e2e8f0', borderStyle: 'none',
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_style', label: 'Background & Border', type: 'separator' },
      { key: 'borderRadius', label: 'Corner Radius', type: 'text', placeholder: '16px, 50%' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'bgImage', label: 'Background Image URL', type: 'url', placeholder: 'https://...' },
      { key: 'bgSize', label: 'BG Image Size', type: 'select', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' }] },
      { key: 'borderWidth', label: 'Border Width', type: 'text', placeholder: '1px, 2px' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderStyle', label: 'Border Style', type: 'select', options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'None', value: 'none' }] },
      ...COMMON_FIELDS
    ],
  },
  accordionItem: {
    label: 'Accordion Item', description: 'Self-contained title & body',
    category: 'layout', emoji: '🔽',
    defaults: {
      title: 'Accordion Title Sample', text: 'This is the hidden content that appears when you click the title.',
      icon: 'ChevronDown', iconType: 'lucide', iconSize: '16px', iconColor: '#64748b',
      iconWidth: '24px', iconHeight: '24px',
      titleBgColor: '#f8fafc', titleTextColor: '#1e293b',
      contentBgColor: '#ffffff', contentTextColor: '#475569',
      borderColor: '#e2e8f0',
      borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px', borderLeftWidth: '1px',
      borderRadius: '8px',
      width: 'auto', height: 'auto',
      padding: '16px', titlePadding: '14px 20px',
      ...TYPO_DEFAULTS,
      contentFontSize: '', contentFontWeight: '', contentTextTransform: 'none',
      contentLetterSpacing: '', contentWordSpacing: '', contentLineHeight: '',
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_header', label: 'Title Header Settings', type: 'separator' },
      { key: 'title', label: 'Header Title', type: 'text' },
      { key: 'titleBgColor', label: 'Header BG Color', type: 'color' },
      { key: 'titleTextColor', label: 'Header Text Color', type: 'color' },
      { key: 'titlePadding', label: 'Header Padding', type: 'text' },
      { key: 'icon', label: 'Icon Name', type: 'text' },
      { key: 'iconSize', label: 'Icon Size (Font)', type: 'text' },
      { key: 'iconWidth', label: 'Icon Wrap Width', type: 'text' },
      { key: 'iconHeight', label: 'Icon Wrap Height', type: 'text' },
      { key: 'iconColor', label: 'Icon Color', type: 'color' },
      ...TYPO_FIELDS(),
      { key: 'sep_content', label: 'Body Content Settings', type: 'separator' },
      { key: 'text', label: 'Body Content', type: 'text', multiline: true },
      { key: 'contentBgColor', label: 'Content BG Color', type: 'color' },
      { key: 'contentTextColor', label: 'Content Text Color', type: 'color' },
      { key: 'padding', label: 'Content Padding', type: 'text' },
      ...TYPO_FIELDS('content'),
      { key: 'sep_border', label: 'General Border & Styling', type: 'separator' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderTopWidth', label: 'Border Top', type: 'text', placeholder: '1px' },
      { key: 'borderRightWidth', label: 'Border Right', type: 'text', placeholder: '1px' },
      { key: 'borderBottomWidth', label: 'Border Bottom', type: 'text', placeholder: '1px' },
      { key: 'borderLeftWidth', label: 'Border Left', type: 'text', placeholder: '1px' },
      { key: 'borderRadius', label: 'Corner Radius', type: 'text' },
      { key: 'width', label: 'Width', type: 'text', placeholder: '100%, 300px' },
      { key: 'height', label: 'Height', type: 'text' },
      ...COMMON_FIELDS
    ],
  },
  hero: {
    label: 'Hero Section', description: 'Full-width banner with CTA',
    category: 'layout', emoji: '🎯',
    defaults: {
      title: 'Welcome to Our Website',
      subtitle: 'We build amazing digital experiences for forward-thinking brands.',
      bgColor: '#1e293b', textColor: '#ffffff',
      ctaText: 'Get Started', ctaUrl: '/', align: 'center', minHeight: 480,
      ...TYPO_DEFAULTS,
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_content', label: 'Banner Content', type: 'separator' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', multiline: true },
      { key: 'ctaText', label: 'Button Text', type: 'text' },
      { key: 'sep_style', label: 'Visual Styles', type: 'separator' },
      { key: 'ctaUrl', label: 'Button URL', type: 'url' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'align', label: 'Alignment', type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      ...TYPO_FIELDS(),
      ...COMMON_FIELDS
    ],
  },
  heading: {
    label: 'Heading', description: 'H1–H4 heading text',
    category: 'content', emoji: 'T',
    defaults: {
      text: 'Section Heading', level: '2', color: '#111827', opacity: 1,
      bgColor: 'transparent', bgImage: '', bgSize: 'cover',
      borderRadius: '0px', borderColor: '#e2e8f0', borderWidth: '0px',
      width: 'auto', height: 'auto', minHeight: 'auto',
      ...TYPO_DEFAULTS, ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_text', label: 'Heading Text', type: 'separator' },
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'level', label: 'Level', type: 'select', options: [{ label: 'H1', value: '1' }, { label: 'H2', value: '2' }, { label: 'H3', value: '3' }, { label: 'H4', value: '4' }] },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'sep_layout', label: 'Sizing & Positioning', type: 'separator' },
      { key: 'width', label: 'Width', type: 'text', placeholder: '100%, auto' },
      { key: 'height', label: 'Height', type: 'text', placeholder: 'auto, 100px' },
      { key: 'minHeight', label: 'Min Height', type: 'text', placeholder: 'auto, 300px' },
      { key: 'sep_background', label: 'Background Styles', type: 'separator' },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'bgImage', label: 'Background Image URL', type: 'url' },
      { key: 'bgSize', label: 'BG Image Size', type: 'select', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Auto', value: 'auto' }] },
      { key: 'sep_border', label: 'Border & Radius', type: 'separator' },
      { key: 'borderWidth', label: 'Border Width', type: 'text' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderRadius', label: 'Corner Radius', type: 'text' },
      ...TYPO_FIELDS(),
      ...COMMON_FIELDS
    ],
  },
  paragraph: {
    label: 'Text Block', description: 'Rich text paragraph',
    category: 'content', emoji: '¶',
    defaults: { html: '<p>Start writing your content here.</p>', color: '#374151', opacity: 1, minHeight: 'auto', ...TYPO_DEFAULTS, ...COMMON_DEFAULTS },
    fields: [
      { key: 'sep_text', label: 'Text Styles', type: 'separator' },
      { key: 'html', label: 'Content', type: 'richtext' },
      { key: 'color', label: 'Text Color', type: 'color' },
      { key: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.1 },
      { key: 'sep_sizing', label: 'Sizing & Positioning', type: 'separator' },
      { key: 'minHeight', label: 'Min Height', type: 'text', placeholder: 'auto, 200px' },
      ...TYPO_FIELDS(),
      ...COMMON_FIELDS
    ],
  },
  image: {
    label: 'Image', description: 'Embed an image with caption',
    category: 'media', emoji: '🖼',
    defaults: {
      src: '', alt: 'Image', caption: '', align: 'center', borderRadius: '8px',
      width: 'auto', height: 'auto', minWidth: '', minHeight: '', maxWidth: '100%', maxHeight: '',
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_image', label: 'Image Content', type: 'separator' },
      { key: 'src', label: 'Image URL', type: 'url' },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'sep_layout', label: 'Sizing & Layout', type: 'separator' },
      { key: 'width', label: 'Width', type: 'text', placeholder: '100%, 300px' },
      { key: 'height', label: 'Height', type: 'text', placeholder: 'auto, 200px' },
      { key: 'minWidth', label: 'Min Width', type: 'text' },
      { key: 'minHeight', label: 'Min Height', type: 'text' },
      { key: 'maxWidth', label: 'Max Width', type: 'text' },
      { key: 'maxHeight', label: 'Max Height', type: 'text' },
      { key: 'borderRadius', label: 'Corner Radius', type: 'text' },
      { key: 'align', label: 'Alignment', type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      ...COMMON_FIELDS
    ],
  },
  button: {
    label: 'Button', description: 'A call-to-action button',
    category: 'actions', emoji: '▶',
    defaults: {
      text: 'Click Here', url: '/', align: 'center', size: 'md',
      width: '', maxWidth: '',
      bgColor: '#2A69C6', textColor: '#ffffff',
      icon: 'ArrowRight', iconPos: 'right', iconSize: 18, iconColor: '#ffffff',
      borderRadius: '12px',
      hoverBg: '#1e4b8f', hoverColor: '#ffffff',
      hoverBorderColor: '', hoverBorderWidth: '0', hoverBorderStyle: 'solid',
      hoverScale: 1.05,
      ...TYPO_DEFAULTS,
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_content', label: 'Button Content', type: 'separator' },
      { key: 'text', label: 'Button Text', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'icon', label: 'Icon (Lucide)', type: 'text' },
      { key: 'iconPos', label: 'Icon Position', type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
      { key: 'iconSize', label: 'Icon Size (px)', type: 'number', min: 10, max: 60, step: 2 },
      { key: 'iconColor', label: 'Icon Color', type: 'color' },
      { key: 'sep_style', label: 'Base Style', type: 'separator' },
      { key: 'width', label: 'Width', type: 'text', placeholder: '100%, 200px, auto' },
      { key: 'maxWidth', label: 'Max Width', type: 'text', placeholder: '400px, 100%' },
      { key: 'align', label: 'Alignment', type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
      { key: 'bgColor', label: 'Background Color', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'borderColor', label: 'Border Color', type: 'color' },
      { key: 'borderWidth', label: 'Border Width (px)', type: 'text', placeholder: '1px, 2px' },
      { key: 'borderRadius', label: 'Border Radius', type: 'text', placeholder: '12px, 50%' },
      { key: 'sep_hover', label: 'Hover Effects', type: 'separator' },
      { key: 'hoverBg', label: 'Hover BG Color', type: 'color' },
      { key: 'hoverColor', label: 'Hover Text Color', type: 'color' },
      { key: 'hoverBorderColor', label: 'Hover Border Color', type: 'color' },
      { key: 'hoverBorderWidth', label: 'Hover Border Width', type: 'text', placeholder: '2px' },
      { key: 'hoverBorderStyle', label: 'Hover Border Style', type: 'select', options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'None', value: 'none' }] },
      { key: 'hoverScale', label: 'Hover Scale', type: 'number', min: 0.5, max: 1.5, step: 0.05 },
      ...TYPO_FIELDS(),
      ...COMMON_FIELDS
    ],
  },
  divider: {
    label: 'Divider', description: 'Horizontal separator line',
    category: 'layout', emoji: '—',
    defaults: { color: '#e5e7eb', thickness: 1, style: 'solid', padding: '0px', ...COMMON_DEFAULTS },
    fields: [
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'thickness', label: 'Thickness (px)', type: 'number', min: 1, max: 8 },
      { key: 'style', label: 'Style', type: 'select', options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] },
      { key: 'padding', label: 'Vertical Padding', type: 'text', placeholder: '20px, 2rem' },
      ...COMMON_FIELDS
    ],
  },
  spacer: {
    label: 'Spacer', description: 'Vertical empty space',
    category: 'layout', emoji: '↕',
    defaults: { height: 64, ...COMMON_DEFAULTS },
    fields: [{ key: 'height', label: 'Height (px)', type: 'number', min: 8, max: 400, step: 8 }, ...COMMON_FIELDS],
  },
  listItem: {
    label: 'List Item', description: 'Text with an icon/image',
    category: 'content', emoji: '🔹',
    defaults: {
      text: 'List item text', icon: 'Check', iconType: 'lucide',
      iconSize: '20px', iconColor: '#2A69C6', gap: '12px',
      bgColor: 'transparent', textColor: '#1e293b',
      borderRadius: '0px', padding: '8px 0px',
      ...TYPO_DEFAULTS,
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_content', label: 'Content', type: 'separator' },
      { key: 'text', label: 'Text Content', type: 'text' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'iconType', label: 'Icon Type', type: 'select', options: [{ label: 'Lucide Library', value: 'lucide' }, { label: 'Custom Image', value: 'image' }] },
      { key: 'icon', label: 'Icon (Name or URL)', type: 'text' },
      { key: 'sep_style', label: 'Visuals', type: 'separator' },
      { key: 'iconSize', label: 'Icon Size', type: 'text', placeholder: '24px, 1.5rem' },
      { key: 'iconColor', label: 'Icon Color (Lucide only)', type: 'color' },
      { key: 'gap', label: 'Gap', type: 'text' },
      ...TYPO_FIELDS(),
      ...COMMON_FIELDS
    ],
  },
  imageBox: {
    label: 'Image Box', description: 'Image with title and text',
    category: 'media', emoji: '🍱',
    defaults: {
      image: '', title: 'Feature Title', titleLevel: '4',
      text: 'Describe this feature in detail here.',
      flexDir: 'row', imageWidth: '100px', gap: '20px',
      bgColor: 'transparent', textColor: '#1e293b',
      borderRadius: '12px', padding: '16px',
      ...TYPO_DEFAULTS,
      descFontSize: '', descFontWeight: '', descTextTransform: 'none',
      descLetterSpacing: '', descWordSpacing: '', descLineHeight: '',
      ...COMMON_DEFAULTS
    },
    fields: [
      { key: 'sep_title', label: 'Headline Settings', type: 'separator' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'image', label: 'Image URL', type: 'url' },
      ...TYPO_FIELDS(),
      { key: 'sep_desc', label: 'Description Settings', type: 'separator' },
      { key: 'text', label: 'Text', type: 'text' },
      ...TYPO_FIELDS('desc'),
      { key: 'sep_layout', label: 'Layout Styling', type: 'separator' },
      { key: 'flexDir', label: 'Layout Direction', type: 'select', options: [
        { label: 'Image Left', value: 'row' }, { label: 'Image Right', value: 'row-reverse' },
        { label: 'Image Top', value: 'column' }, { label: 'Image Bottom', value: 'column-reverse' },
      ]},
      { key: 'imageWidth', label: 'Image Size', type: 'text' },
      { key: 'gap', label: 'Gap', type: 'text' },
      { key: 'bgColor', label: 'Background', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      ...COMMON_FIELDS
    ],
  },
  card: {
    label: 'Feature Card', description: 'Highlighted content card',
    category: 'content', emoji: '⬡',
    defaults: { title: 'Feature Title', body: 'A short description...', bgColor: '#ffffff', accentColor: '#2A69C6', shadow: true, ...COMMON_DEFAULTS },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Body Text', type: 'text', multiline: true },
      { key: 'bgColor', label: 'Background', type: 'color' },
      ...COMMON_FIELDS
    ],
  },
  cta: {
    label: 'CTA Banner', description: 'Full-width call-to-action',
    category: 'actions', emoji: '📣',
    defaults: { title: 'Ready?', description: 'Join us...', buttonText: 'Get Started', buttonUrl: '/', bgColor: '#2A69C6', textColor: '#ffffff', ...COMMON_DEFAULTS },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'buttonText', label: 'Button Text', type: 'text' },
      ...COMMON_FIELDS
    ],
  },
  columns: {
    label: '2 Columns', description: 'Side-by-side content columns',
    category: 'layout', emoji: '⬛⬛',
    defaults: { col1Title: 'Left Column', col2Title: 'Right Column', bgColor: '#f9fafb', ...COMMON_DEFAULTS },
    fields: [
      { key: 'col1Title', label: 'Left Title', type: 'text' },
      { key: 'col2Title', label: 'Right Title', type: 'text' },
      ...COMMON_FIELDS
    ],
  },
  stats: {
    label: 'Stats Section', description: 'Showcase key metrics',
    category: 'content', emoji: '📊',
    defaults: { stat1Value: '1,000+', stat1Label: 'Clients', bgColor: '#f8fafc', accentColor: '#2A69C6', ...COMMON_DEFAULTS },
    fields: [
      { key: 'stat1Value', label: 'Stat 1 Value', type: 'text' },
      { key: 'stat1Label', label: 'Stat 1 Label', type: 'text' },
      ...COMMON_FIELDS
    ],
  },
  widget: {
    label: 'Custom Widget', description: 'Embed a React component widget',
    category: 'actions', emoji: '🧩',
    defaults: { widgetName: 'contact_form', ...COMMON_DEFAULTS },
    fields: [
      { key: 'sep_widget', label: 'Widget Settings', type: 'separator' },
      { key: 'widgetName', label: 'Select Widget', type: 'select', options: WIDGET_OPTIONS },
      ...COMMON_FIELDS
    ]
  }
};

export const createBlock = (type: BlockType): Block => {
  const block: Block = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    props: { ...BLOCK_CATALOG[type].defaults },
  };

  if (type === 'container') {
    block.children = [];
  }

  return block;
};

export const CATEGORY_ORDER = ['layout', 'content', 'media', 'actions'] as const;
export const CATEGORY_LABELS: Record<string, string> = {
  layout: 'Layout', content: 'Content', media: 'Media', actions: 'Actions',
};

// ============================================================
// Backward-compatible exports for existing Builder code
// ============================================================

/** Legacy: Map of block type strings to their keys */
export const BLOCK_TYPES = Object.fromEntries(
  Object.keys(BLOCK_CATALOG).map(key => [key.toUpperCase(), key])
) as Record<string, BlockType>;

/** Legacy: Alias for BLOCK_CATALOG */
export const BLOCK_DEFINITIONS = BLOCK_CATALOG;

/** Legacy: Get block definition by type */
export const getBlockDefinition = (type: BlockType | string): BlockDef | null => {
  return BLOCK_CATALOG[type as BlockType] || null;
};

/** Legacy: Get blocks by category (maps new categories to old ones) */
const CATEGORY_MAP: Record<string, string> = {
  layout: 'layout', content: 'basic', media: 'media', actions: 'advanced',
};
export const getBlocksByCategory = (category: string) => {
  const mappedCategory = CATEGORY_MAP[category] || category;
  return Object.entries(BLOCK_CATALOG)
    .filter(([, def]) => def.category === mappedCategory || def.category === category)
    .map(([, def]) => def);
};
