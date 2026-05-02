import React from 'react';
import {
  Type,
  AlignLeft,
  MousePointerClick,
  Minus,
  MoveVertical,
  Box,
  Image,
  ListChecks,
  List,
  Clock,
  Hash,
  Menu,
  ImagePlus,
  Puzzle,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';

// ============= INTERFACES =============

export interface ControlDefinition {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "color" | "select" | "toggle" | "richtext" | "image-url";
  options?: { label: string; value: string | number }[] | string[];
}

export interface ElementDefinition {
  type: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  category: "basic" | "layout" | "media" | "advanced";
  defaultProps: Record<string, any>;
  controls: ControlDefinition[];
  component: React.FC<any>;
}

// ============= BASIC ELEMENTS =============

// Heading Element Component
export const HeadingComponent: React.FC<any> = ({ content, level, align, color, ...rest }) => {
  const Tag = level || 'h2';
  const htmlContent = content || 'Heading Text';
  return (
    <div style={{ textAlign: align || 'left' }} {...rest}>
      <Tag
        style={{ color: color || '#000000' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export const HeadingElement: ElementDefinition = {
  type: 'heading',
  label: 'Heading',
  icon: Type,
  category: 'basic',
  defaultProps: {
    content: '<h2>Heading Text</h2>',
    level: 'h2',
    align: 'left',
    color: '#000000',
  },
  controls: [
    { key: 'content', label: 'Content', type: 'richtext' },
    { key: 'level', label: 'Heading Level', type: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'color', label: 'Color', type: 'color' },
  ],
  component: HeadingComponent,
};

// Text Element Component
export const TextComponent: React.FC<any> = ({ content, fontSize, color, align, ...rest }) => {
  const htmlContent = content || '<p>Enter your text here...</p>';
  return (
    <div
      style={{
        fontSize: fontSize || 16,
        color: color || '#333333',
        textAlign: align || 'left',
      }}
      {...rest}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export const TextElement: ElementDefinition = {
  type: 'text',
  label: 'Text',
  icon: AlignLeft,
  category: 'basic',
  defaultProps: {
    content: '<p>Enter your text here...</p>',
    fontSize: 16,
    color: '#333333',
    align: 'left',
  },
  controls: [
    { key: 'content', label: 'Content', type: 'richtext' },
    { key: 'fontSize', label: 'Font Size', type: 'number' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right', 'justify'] },
  ],
  component: TextComponent,
};

// Button Element Component
export const ButtonComponent: React.FC<any> = ({ label, href, variant, size, color, bgColor, ...rest }) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const bgStyle: React.CSSProperties = {};
  const textStyle: React.CSSProperties = {};

  if (variant === 'primary') {
    bgStyle.backgroundColor = bgColor || '#3b82f6';
    textStyle.color = '#ffffff';
  } else if (variant === 'secondary') {
    bgStyle.backgroundColor = '#e5e7eb';
    textStyle.color = '#374151';
  } else if (variant === 'outline') {
    bgStyle.backgroundColor = 'transparent';
    bgStyle.border = `2px solid ${bgColor || '#3b82f6'}`;
    textStyle.color = bgColor || '#3b82f6';
  }

  return (
    <div {...rest}>
      <a
        href={href || '#'}
        className={`inline-block font-medium rounded transition-colors cursor-pointer ${sizeClasses[size || 'md']}`}
        style={{ ...bgStyle, ...textStyle }}
      >
        {label || 'Click Me'}
      </a>
    </div>
  );
};

export const ButtonElement: ElementDefinition = {
  type: 'button',
  label: 'Button',
  icon: MousePointerClick,
  category: 'basic',
  defaultProps: {
    label: 'Click Me',
    href: '#',
    variant: 'primary',
    size: 'md',
    color: '#ffffff',
    bgColor: '#3b82f6',
  },
  controls: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'href', label: 'Link URL', type: 'text' },
    { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'outline'] },
    { key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
    { key: 'color', label: 'Text Color', type: 'color' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  component: ButtonComponent,
};

// Divider Element Component
export const DividerComponent: React.FC<any> = ({ thickness, color, style: divStyle, ...rest }) => {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${thickness || 1}px ${divStyle || 'solid'} ${color || '#e5e7eb'}`,
        margin: '16px 0',
      }}
      {...rest}
    />
  );
};

export const DividerElement: ElementDefinition = {
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  category: 'basic',
  defaultProps: {
    thickness: 1,
    color: '#e5e7eb',
    style: 'solid',
  },
  controls: [
    { key: 'thickness', label: 'Thickness', type: 'number' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'style', label: 'Style', type: 'select', options: ['solid', 'dashed', 'dotted'] },
  ],
  component: DividerComponent,
};

// Spacer Element Component
export const SpacerComponent: React.FC<any> = ({ height, ...rest }) => {
  return (
    <div
      style={{ height: height || 40, width: '100%' }}
      {...rest}
      aria-label="Spacer"
    />
  );
};

export const SpacerElement: ElementDefinition = {
  type: 'spacer',
  label: 'Spacer',
  icon: MoveVertical,
  category: 'basic',
  defaultProps: {
    height: 40,
  },
  controls: [
    { key: 'height', label: 'Height (px)', type: 'number' },
  ],
  component: SpacerComponent,
};

// ============= LAYOUT ELEMENTS =============

// Container Element Component (Container)
export const ContainerComponent: React.FC<any> = ({ bgColor, bgImage, bgSize, width, height, minWidth, minHeight, maxWidth, maxHeight, borderRadius, borderWidth, borderColor, borderStyle, padding, direction, align, justify, gap, children, ...rest }) => {
  const bgStyle: React.CSSProperties = {};
  if (bgColor && bgColor !== 'transparent') bgStyle.backgroundColor = bgColor;
  if (bgImage) {
    bgStyle.backgroundImage = `url(${bgImage})`;
    bgStyle.backgroundSize = bgSize || 'cover';
    bgStyle.backgroundPosition = 'center';
    bgStyle.backgroundRepeat = 'no-repeat';
  }

  const borderStyleObj: React.CSSProperties = {};
  if (borderWidth && borderWidth !== '0px') {
    borderStyleObj.borderWidth = borderWidth;
    borderStyleObj.borderColor = borderColor || '#e2e8f0';
    borderStyleObj.borderStyle = borderStyle || 'solid';
  }

  return (
    <div
      style={{
        ...bgStyle,
        ...borderStyleObj,
        width: width || '100%',
        height: height || 'auto',
        minWidth: minWidth || undefined,
        minHeight: minHeight || undefined,
        maxWidth: maxWidth || undefined,
        maxHeight: maxHeight || undefined,
        borderRadius: borderRadius || undefined,
        padding: padding || '16px',
        display: 'flex',
        flexDirection: direction || 'column',
        alignItems: align || 'stretch',
        justifyContent: justify || 'flex-start',
        gap: gap || '16px',
      }}
      className="min-h-[50px] w-full"
      {...rest}
    >
      {children}
    </div>
  );
};

export const ContainerElement: ElementDefinition = {
  type: 'container',
  label: 'Container',
  icon: Box,
  category: 'layout',
  defaultProps: {
    bgColor: 'transparent',
    bgImage: '',
    bgSize: 'cover',
    width: '',
    height: '',
    minWidth: '',
    minHeight: '',
    maxWidth: '',
    maxHeight: '',
    borderRadius: '',
    borderWidth: '0px',
    borderColor: '#e2e8f0',
    borderStyle: 'none',
    padding: '16px',
    direction: 'column',
    align: 'stretch',
    justify: 'flex-start',
    gap: '16px',
  },
  controls: [
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'bgImage', label: 'Background Image URL', type: 'image-url' },
    { key: 'bgSize', label: 'BG Size', type: 'select', options: ['cover', 'contain', 'auto'] },
    { key: 'padding', label: 'Padding', type: 'text' },
    { key: 'direction', label: 'Direction', type: 'select', options: ['row', 'column'] },
    { key: 'align', label: 'Align Items', type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
    { key: 'justify', label: 'Justify Content', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
    { key: 'gap', label: 'Gap', type: 'text' },
    { key: 'borderRadius', label: 'Border Radius', type: 'text' },
    { key: 'borderWidth', label: 'Border Width', type: 'text' },
    { key: 'borderColor', label: 'Border Color', type: 'color' },
    { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  ],
  component: ContainerComponent,
};

// ============= MEDIA ELEMENTS =============

// Image Element Component
export const ImageComponent: React.FC<any> = ({ src, alt, width, height, objectFit, borderRadius, ...rest }) => {
  return (
    <div style={{ width: width || '100%', height: height || 'auto' }} {...rest}>
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          style={{
            width: '100%',
            height: height || 'auto',
            objectFit: objectFit || 'cover',
            borderRadius: borderRadius || '0',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: height || '200px',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius || '0',
          }}
        >
          <span style={{ color: '#9ca3af' }}>No image selected</span>
        </div>
      )}
    </div>
  );
};

export const ImageElement: ElementDefinition = {
  type: 'image',
  label: 'Image',
  icon: Image,
  category: 'media',
  defaultProps: {
    src: '',
    alt: '',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '0',
  },
  controls: [
    { key: 'src', label: 'Image URL', type: 'image-url' },
    { key: 'alt', label: 'Alt Text', type: 'text' },
    { key: 'width', label: 'Width', type: 'text' },
    { key: 'height', label: 'Height', type: 'text' },
    { key: 'objectFit', label: 'Object Fit', type: 'select', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
    { key: 'borderRadius', label: 'Border Radius', type: 'text' },
  ],
  component: ImageComponent,
};

// ============= ADVANCED ELEMENTS =============

// Widget Element Component
export const WidgetComponent: React.FC<any> = ({ widgetName, ...rest }) => {
  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        border: '2px dashed #cbd5e1',
        borderRadius: '8px',
        textAlign: 'center',
      }}
      {...rest}
    >
      <Puzzle size={32} className="mx-auto mb-2 text-gray-400" />
      <p className="text-gray-500 font-medium">Widget: {widgetName || 'Not selected'}</p>
      <p className="text-gray-400 text-sm mt-1">Widget renders on the live site</p>
    </div>
  );
};

export const WidgetElement: ElementDefinition = {
  type: 'widget',
  label: 'Widget',
  icon: Puzzle,
  category: 'advanced',
  defaultProps: {
    widgetName: 'contact_form',
  },
  controls: [
    { key: 'widgetName', label: 'Widget Name', type: 'select', options: [
      { label: 'Contact Form', value: 'contact_form' },
      { label: 'Login Form', value: 'login_form' },
      { label: 'Register Form', value: 'register_form' },
      { label: 'Newsletter Form', value: 'newsletter_form' },
    ]},
  ],
  component: WidgetComponent,
};

// Accordion Item Element Component
export const AccordionItemComponent: React.FC<any> = ({ title, text, icon, iconSize, iconColor, titleBgColor, titleTextColor, contentBgColor, contentTextColor, borderColor, borderRadius, padding, ...rest }) => {
  const IconComp = icon ? ChevronDown : null;
  return (
    <div
      style={{
        border: `1px solid ${borderColor || '#e2e8f0'}`,
        borderRadius: borderRadius || '8px',
        overflow: 'hidden',
      }}
      {...rest}
    >
      <div
        style={{
          backgroundColor: titleBgColor || '#f8fafc',
          color: titleTextColor || '#1e293b',
          padding: padding || '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
        }}
      >
        <span>{title || 'Accordion Title'}</span>
        {IconComp && <IconComp size={parseInt(iconSize) || 16} style={{ color: iconColor || '#64748b' }} />}
      </div>
      <div
        style={{
          backgroundColor: contentBgColor || '#ffffff',
          color: contentTextColor || '#475569',
          padding: padding || '14px 20px',
        }}
      >
        {text || 'Accordion content goes here...'}
      </div>
    </div>
  );
};

export const AccordionItemElement: ElementDefinition = {
  type: 'accordionItem',
  label: 'Accordion Item',
  icon: ChevronDown,
  category: 'advanced',
  defaultProps: {
    title: 'Accordion Title',
    text: 'This is the hidden content that appears when you click the title.',
    icon: 'ChevronDown',
    iconSize: '16',
    iconColor: '#64748b',
    titleBgColor: '#f8fafc',
    titleTextColor: '#1e293b',
    contentBgColor: '#ffffff',
    contentTextColor: '#475569',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    padding: '14px 20px',
  },
  controls: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'text', label: 'Content', type: 'textarea' },
    { key: 'icon', label: 'Icon Name', type: 'text' },
    { key: 'iconSize', label: 'Icon Size', type: 'text' },
    { key: 'iconColor', label: 'Icon Color', type: 'color' },
    { key: 'titleBgColor', label: 'Title BG Color', type: 'color' },
    { key: 'titleTextColor', label: 'Title Text Color', type: 'color' },
    { key: 'contentBgColor', label: 'Content BG Color', type: 'color' },
    { key: 'contentTextColor', label: 'Content Text Color', type: 'color' },
    { key: 'borderColor', label: 'Border Color', type: 'color' },
    { key: 'borderRadius', label: 'Border Radius', type: 'text' },
    { key: 'padding', label: 'Padding', type: 'text' },
  ],
  component: AccordionItemComponent,
};

// Tabs Element Component
export const TabsComponent: React.FC<any> = ({ tabs, activeTab, bgColor, textColor, activeBgColor, activeTextColor, borderColor, ...rest }) => {
  let parsedTabs = [];
  try {
    parsedTabs = tabs ? JSON.parse(tabs) : [
      { label: 'Tab 1', content: 'Content for tab 1' },
      { label: 'Tab 2', content: 'Content for tab 2' },
    ];
  } catch {
    parsedTabs = [
      { label: 'Tab 1', content: 'Content for tab 1' },
      { label: 'Tab 2', content: 'Content for tab 2' },
    ];
  }

  return (
    <div {...rest}>
      <div style={{ display: 'flex', borderBottom: `2px solid ${borderColor || '#e2e8f0'}`, gap: '4px' }}>
        {parsedTabs.map((tab: any, i: number) => (
          <button
            key={i}
            style={{
              padding: '10px 20px',
              backgroundColor: i === 0 ? (activeBgColor || '#3b82f6') : (bgColor || 'transparent'),
              color: i === 0 ? (activeTextColor || '#ffffff') : (textColor || '#64748b'),
              border: 'none',
              borderBottom: i === 0 ? `2px solid ${activeBgColor || '#3b82f6'}` : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontWeight: i === 0 ? 600 : 400,
              borderRadius: '4px 4px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px', color: textColor || '#374151' }}>
        {parsedTabs[0]?.content || 'Tab content'}
      </div>
    </div>
  );
};

export const TabsElement: ElementDefinition = {
  type: 'tabs',
  label: 'Tabs',
  icon: LayoutGrid,
  category: 'advanced',
  defaultProps: {
    tabs: JSON.stringify([
      { label: 'Tab 1', content: 'Content for tab 1' },
      { label: 'Tab 2', content: 'Content for tab 2' },
      { label: 'Tab 3', content: 'Content for tab 3' },
    ]),
    bgColor: 'transparent',
    textColor: '#64748b',
    activeBgColor: '#3b82f6',
    activeTextColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  controls: [
    { key: 'tabs', label: 'Tabs (JSON)', type: 'textarea' },
    { key: 'bgColor', label: 'Tab BG Color', type: 'color' },
    { key: 'textColor', label: 'Tab Text Color', type: 'color' },
    { key: 'activeBgColor', label: 'Active BG Color', type: 'color' },
    { key: 'activeTextColor', label: 'Active Text Color', type: 'color' },
    { key: 'borderColor', label: 'Border Color', type: 'color' },
  ],
  component: TabsComponent,
};

// Icon Element Component
export const IconComponent: React.FC<any> = ({ icon, size, color, align, ...rest }) => {
  const IconComp = ListChecks; // fallback
  return (
    <div style={{ textAlign: align || 'center' }} {...rest}>
      <IconComp size={parseInt(size) || 32} style={{ color: color || '#3b82f6' }} />
    </div>
  );
};

export const IconElement: ElementDefinition = {
  type: 'icon',
  label: 'Icon',
  icon: ListChecks,
  category: 'media',
  defaultProps: {
    icon: 'Check',
    size: '32',
    color: '#3b82f6',
    align: 'center',
  },
  controls: [
    { key: 'icon', label: 'Icon Name (Lucide)', type: 'text' },
    { key: 'size', label: 'Size (px)', type: 'text' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
  ],
  component: IconComponent,
};

// List Item Element Component
export const ListItemComponent: React.FC<any> = ({ text, icon, iconType, iconSize, iconColor, gap, textColor, ...rest }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: gap || '12px' }}
      {...rest}
    >
      <div style={{ color: iconColor || '#3b82f6', flexShrink: 0 }}>
        <ListChecks size={parseInt(iconSize) || 20} />
      </div>
      <span style={{ color: textColor || '#1e293b' }}>{text || 'List item text'}</span>
    </div>
  );
};

export const ListItemElement: ElementDefinition = {
  type: 'listItem',
  label: 'List Item',
  icon: List,
  category: 'advanced',
  defaultProps: {
    text: 'List item text',
    icon: 'Check',
    iconType: 'lucide',
    iconSize: '20',
    iconColor: '#3b82f6',
    gap: '12px',
    textColor: '#1e293b',
  },
  controls: [
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'icon', label: 'Icon Name', type: 'text' },
    { key: 'iconSize', label: 'Icon Size', type: 'text' },
    { key: 'iconColor', label: 'Icon Color', type: 'color' },
    { key: 'gap', label: 'Gap', type: 'text' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
  ],
  component: ListItemComponent,
};

// Timeline Element Component
export const TimelineComponent: React.FC<any> = ({ items, lineColor, dotColor, textColor, ...rest }) => {
  let parsedItems = [];
  try {
    parsedItems = items ? JSON.parse(items) : [
      { title: 'Event 1', description: 'Description of event 1' },
      { title: 'Event 2', description: 'Description of event 2' },
    ];
  } catch {
    parsedItems = [
      { title: 'Event 1', description: 'Description of event 1' },
      { title: 'Event 2', description: 'Description of event 2' },
    ];
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '30px' }} {...rest}>
      <div style={{
        position: 'absolute', left: '8px', top: 0, bottom: 0,
        width: '2px', backgroundColor: lineColor || '#e2e8f0',
      }} />
      {parsedItems.map((item: any, i: number) => (
        <div key={i} style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{
            position: 'absolute', left: '-26px', top: '4px',
            width: '14px', height: '14px', borderRadius: '50%',
            backgroundColor: dotColor || '#3b82f6',
          }} />
          <h4 style={{ margin: '0 0 4px', color: textColor || '#1e293b', fontWeight: 600 }}>{item.title}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export const TimelineElement: ElementDefinition = {
  type: 'timeline',
  label: 'Timeline',
  icon: Clock,
  category: 'advanced',
  defaultProps: {
    items: JSON.stringify([
      { title: 'Event 1', description: 'Description of event 1' },
      { title: 'Event 2', description: 'Description of event 2' },
      { title: 'Event 3', description: 'Description of event 3' },
    ]),
    lineColor: '#e2e8f0',
    dotColor: '#3b82f6',
    textColor: '#1e293b',
  },
  controls: [
    { key: 'items', label: 'Items (JSON)', type: 'textarea' },
    { key: 'lineColor', label: 'Line Color', type: 'color' },
    { key: 'dotColor', label: 'Dot Color', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
  ],
  component: TimelineComponent,
};

// Counter Element Component
export const CounterComponent: React.FC<any> = ({ value, label, prefix, suffix, color, bgColor, ...rest }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '24px',
        backgroundColor: bgColor || '#f8fafc',
        borderRadius: '8px',
      }}
      {...rest}
    >
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: color || '#3b82f6' }}>
        {prefix || ''}{value || '100'}{suffix || ''}
      </div>
      {label && <p style={{ marginTop: '8px', color: '#64748b', fontSize: '16px' }}>{label}</p>}
    </div>
  );
};

export const CounterElement: ElementDefinition = {
  type: 'counter',
  label: 'Counter',
  icon: Hash,
  category: 'advanced',
  defaultProps: {
    value: '100',
    label: 'Happy Clients',
    prefix: '',
    suffix: '+',
    color: '#3b82f6',
    bgColor: '#f8fafc',
  },
  controls: [
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'prefix', label: 'Prefix', type: 'text' },
    { key: 'suffix', label: 'Suffix', type: 'text' },
    { key: 'color', label: 'Number Color', type: 'color' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
  ],
  component: CounterComponent,
};

// Menu Element Component
export const MenuComponent: React.FC<any> = ({ items, bgColor, textColor, hoverColor, activeColor, align, ...rest }) => {
  let parsedItems = [];
  try {
    parsedItems = items ? JSON.parse(items) : [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' },
    ];
  } catch {
    parsedItems = [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' },
    ];
  }

  return (
    <nav
      style={{
        backgroundColor: bgColor || '#ffffff',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: '24px',
        borderRadius: '8px',
      }}
      {...rest}
    >
      {parsedItems.map((item: any, i: number) => (
        <a
          key={i}
          href={item.url || '#'}
          style={{
            color: i === 0 ? (activeColor || '#3b82f6') : (textColor || '#374151'),
            textDecoration: 'none',
            fontWeight: i === 0 ? 600 : 400,
            fontSize: '15px',
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export const MenuElement: ElementDefinition = {
  type: 'menu',
  label: 'Menu',
  icon: Menu,
  category: 'advanced',
  defaultProps: {
    items: JSON.stringify([
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '/contact' },
    ]),
    bgColor: '#ffffff',
    textColor: '#374151',
    hoverColor: '#3b82f6',
    activeColor: '#3b82f6',
    align: 'left',
  },
  controls: [
    { key: 'items', label: 'Menu Items (JSON)', type: 'textarea' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
    { key: 'hoverColor', label: 'Hover Color', type: 'color' },
    { key: 'activeColor', label: 'Active Color', type: 'color' },
    { key: 'align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
  ],
  component: MenuComponent,
};

// Image Box Element Component
export const ImageBoxComponent: React.FC<any> = ({ image, title, titleLevel, text, flexDir, imageWidth, gap, bgColor, textColor, borderRadius, padding, ...rest }) => {
  const Tag = titleLevel ? `h${titleLevel}` : 'h4';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: flexDir || 'row',
        gap: gap || '20px',
        backgroundColor: bgColor || 'transparent',
        color: textColor || '#1e293b',
        borderRadius: borderRadius || '12px',
        padding: padding || '16px',
        alignItems: 'center',
      }}
      {...rest}
    >
      {image ? (
        <img
          src={image}
          alt={title || ''}
          style={{
            width: imageWidth || '100px',
            height: imageWidth || '100px',
            objectFit: 'cover',
            borderRadius: borderRadius || '12px',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: imageWidth || '100px',
            height: imageWidth || '100px',
            backgroundColor: '#e5e7eb',
            borderRadius: borderRadius || '12px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImagePlus size={24} className="text-gray-400" />
        </div>
      )}
      <div>
        {title && <Tag style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>{title}</Tag>}
        {text && <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{text}</p>}
      </div>
    </div>
  );
};

export const ImageBoxElement: ElementDefinition = {
  type: 'imageBox',
  label: 'Image Box',
  icon: ImagePlus,
  category: 'media',
  defaultProps: {
    image: '',
    title: 'Feature Title',
    titleLevel: '4',
    text: 'Describe this feature in detail here.',
    flexDir: 'row',
    imageWidth: '100px',
    gap: '20px',
    bgColor: 'transparent',
    textColor: '#1e293b',
    borderRadius: '12px',
    padding: '16px',
  },
  controls: [
    { key: 'image', label: 'Image URL', type: 'image-url' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'titleLevel', label: 'Heading Level', type: 'select', options: ['h2', 'h3', 'h4', 'h5', 'h6'] },
    { key: 'text', label: 'Description', type: 'textarea' },
    { key: 'flexDir', label: 'Layout', type: 'select', options: [
      { label: 'Image Left', value: 'row' },
      { label: 'Image Right', value: 'row-reverse' },
      { label: 'Image Top', value: 'column' },
      { label: 'Image Bottom', value: 'column-reverse' },
    ]},
    { key: 'imageWidth', label: 'Image Size', type: 'text' },
    { key: 'gap', label: 'Gap', type: 'text' },
    { key: 'bgColor', label: 'Background', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'color' },
    { key: 'borderRadius', label: 'Border Radius', type: 'text' },
    { key: 'padding', label: 'Padding', type: 'text' },
  ],
  component: ImageBoxComponent,
};

// ============= EXPORTS =============

export const ELEMENTS: ElementDefinition[] = [
  // Basic
  HeadingElement,
  TextElement,
  ButtonElement,
  DividerElement,
  SpacerElement,
  // Layout
  ContainerElement,
  // Media
  ImageElement,
  IconElement,
  ImageBoxElement,
  // Advanced
  WidgetElement,
  AccordionItemElement,
  TabsElement,
  ListItemElement,
  TimelineElement,
  CounterElement,
  MenuElement,
];

export const ELEMENTS_BY_TYPE: Record<string, ElementDefinition> = ELEMENTS.reduce(
  (acc, el) => {
    acc[el.type] = el;
    return acc;
  },
  {} as Record<string, ElementDefinition>
);

export const ELEMENTS_BY_CATEGORY: Record<string, ElementDefinition[]> = ELEMENTS.reduce(
  (acc, el) => {
    if (!acc[el.category]) {
      acc[el.category] = [];
    }
    acc[el.category].push(el);
    return acc;
  },
  {} as Record<string, ElementDefinition[]>
);

// Container types that can accept children
export const CONTAINER_TYPES = ['container'];
