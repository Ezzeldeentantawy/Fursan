import React, { useState, useEffect } from 'react';
import { BuilderNode } from '../utils/nodeFactory';
import { LayoutTemplate, X, Search, CheckCheck, Loader2, Save, Trash2 } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  tree: BuilderNode;
  createdAt?: string;
}

// Sample templates to demonstrate the feature
const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Hero section with features and CTA',
    thumbnail: '🚀',
    tree: {
      id: 'root',
      type: 'container',
      props: { bgColor: 'white', padding: '20px', direction: 'column', gap: '20px' },
      children: [
        {
          id: 'hero-1',
          type: 'container',
          props: { bgColor: '#f0f9ff', padding: '60px', direction: 'column', align: 'center', gap: '20px' },
          children: [
            {
              id: 'h-1',
              type: 'heading',
              props: { content: '<h1>Welcome to Our Product</h1>', level: 'h1', align: 'center', color: '#1e293b' },
              children: []
            },
            {
              id: 'p-1',
              type: 'paragraph',
              props: { content: '<p>Start building your dream landing page today with our powerful drag-and-drop builder.</p>', align: 'center' },
              children: []
            },
            {
              id: 'btn-1',
              type: 'button',
              props: { label: 'Get Started', href: '#', variant: 'primary', bgColor: '#3b82f6', textColor: '#ffffff' },
              children: []
            },
          ]
        },
        {
          id: 'features-1',
          type: 'container',
          props: { padding: '40px', direction: 'row', gap: '20px', justify: 'center', wrap: 'wrap' },
          children: [
            {
              id: 'f1',
              type: 'container',
              props: { padding: '20px', direction: 'column', align: 'center', gap: '10px', bgColor: '#ffffff', borderRadius: '8px', borderWidth: '1px', borderColor: '#e2e8f0', borderStyle: 'solid' },
              children: [
                {
                  id: 'icon-1',
                  type: 'icon',
                  props: { name: 'Zap', size: 48, color: '#3b82f6' },
                  children: []
                },
                {
                  id: 'fh1',
                  type: 'heading',
                  props: { content: '<h3>Fast Performance</h3>', level: 'h3', align: 'center' },
                  children: []
                },
                {
                  id: 'fp1',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm text-gray-600">Lightning fast load times and smooth interactions.</p>', align: 'center' },
                  children: []
                },
              ]
            },
            {
              id: 'f2',
              type: 'container',
              props: { padding: '20px', direction: 'column', align: 'center', gap: '10px', bgColor: '#ffffff', borderRadius: '8px', borderWidth: '1px', borderColor: '#e2e8f0', borderStyle: 'solid' },
              children: [
                {
                  id: 'icon-2',
                  type: 'icon',
                  props: { name: 'Shield', size: 48, color: '#10b981' },
                  children: []
                },
                {
                  id: 'fh2',
                  type: 'heading',
                  props: { content: '<h3>Secure & Reliable</h3>', level: 'h3', align: 'center' },
                  children: []
                },
                {
                  id: 'fp2',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm text-gray-600">Enterprise-grade security you can trust.</p>', align: 'center' },
                  children: []
                },
              ]
            },
            {
              id: 'f3',
              type: 'container',
              props: { padding: '20px', direction: 'column', align: 'center', gap: '10px', bgColor: '#ffffff', borderRadius: '8px', borderWidth: '1px', borderColor: '#e2e8f0', borderStyle: 'solid' },
              children: [
                {
                  id: 'icon-3',
                  type: 'icon',
                  props: { name: 'Smartphone', size: 48, color: '#8b5cf6' },
                  children: []
                },
                {
                  id: 'fh3',
                  type: 'heading',
                  props: { content: '<h3>Mobile Responsive</h3>', level: 'h3', align: 'center' },
                  children: []
                },
                {
                  id: 'fp3',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm text-gray-600">Looks great on all devices and screen sizes.</p>', align: 'center' },
                  children: []
                },
              ]
            },
          ]
        },
      ]
    } as BuilderNode,
  },
  {
    id: 'about-page',
    name: 'About Us',
    description: 'About page with team section',
    thumbnail: '👥',
    tree: {
      id: 'root',
      type: 'container',
      props: { bgColor: 'white', padding: '20px', direction: 'column', gap: '30px' },
      children: [
        {
          id: 'about-hero',
          type: 'container',
          props: { padding: '40px', direction: 'column', align: 'center', gap: '15px' },
          children: [
            {
              id: 'about-title',
              type: 'heading',
              props: { content: '<h1>About Our Company</h1>', level: 'h1', align: 'center' },
              children: []
            },
            {
              id: 'about-desc',
              type: 'paragraph',
              props: { content: '<p>We are a passionate team dedicated to building amazing products that help businesses grow.</p>', align: 'center' },
              children: []
            },
          ]
        },
        {
          id: 'team-section',
          type: 'container',
          props: { padding: '30px', direction: 'column', gap: '20px' },
          children: [
            {
              id: 'team-title',
              type: 'heading',
              props: { content: '<h2>Our Team</h2>', level: 'h2', align: 'center' },
              children: []
            },
            {
              id: 'team-grid',
              type: 'container',
              props: { direction: 'row', gap: '20px', justify: 'center', wrap: 'wrap' },
              children: [
                {
                  id: 'member-1',
                  type: 'container',
                  props: { padding: '20px', direction: 'column', align: 'center', gap: '10px', bgColor: '#f8fafc', borderRadius: '12px' },
                  children: [
                    {
                      id: 'member-img-1',
                      type: 'image',
                      props: { src: 'https://via.placeholder.com/150', alt: 'Team Member', borderRadius: '50%' },
                      children: []
                    },
                    {
                      id: 'member-name-1',
                      type: 'heading',
                      props: { content: '<h4>John Doe</h4>', level: 'h4', align: 'center' },
                      children: []
                    },
                    {
                      id: 'member-role-1',
                      type: 'paragraph',
                      props: { content: '<p class="text-sm text-gray-600">CEO & Founder</p>', align: 'center' },
                      children: []
                    },
                  ]
                },
                {
                  id: 'member-2',
                  type: 'container',
                  props: { padding: '20px', direction: 'column', align: 'center', gap: '10px', bgColor: '#f8fafc', borderRadius: '12px' },
                  children: [
                    {
                      id: 'member-img-2',
                      type: 'image',
                      props: { src: 'https://via.placeholder.com/150', alt: 'Team Member', borderRadius: '50%' },
                      children: []
                    },
                    {
                      id: 'member-name-2',
                      type: 'heading',
                      props: { content: '<h4>Jane Smith</h4>', level: 'h4', align: 'center' },
                      children: []
                    },
                    {
                      id: 'member-role-2',
                      type: 'paragraph',
                      props: { content: '<p class="text-sm text-gray-600">CTO</p>', align: 'center' },
                      children: []
                    },
                  ]
                },
              ]
            },
          ]
        },
      ]
    } as BuilderNode,
  },
  {
    id: 'contact-page',
    name: 'Contact Us',
    description: 'Contact page with form and map',
    thumbnail: '📞',
    tree: {
      id: 'root',
      type: 'container',
      props: { bgColor: 'white', padding: '20px', direction: 'column', gap: '30px' },
      children: [
        {
          id: 'contact-hero',
          type: 'container',
          props: { padding: '40px', direction: 'column', align: 'center', gap: '15px', bgColor: '#f0f9ff' },
          children: [
            {
              id: 'contact-title',
              type: 'heading',
              props: { content: '<h1>Contact Us</h1>', level: 'h1', align: 'center' },
              children: []
            },
            {
              id: 'contact-desc',
              type: 'paragraph',
              props: { content: '<p>Get in touch with our team. We\'d love to hear from you.</p>', align: 'center' },
              children: []
            },
          ]
        },
        {
          id: 'contact-content',
          type: 'container',
          props: { direction: 'row', gap: '30px', padding: '20px', wrap: 'wrap' },
          children: [
            {
              id: 'contact-form',
              type: 'container',
              props: { flex: '1', minWidth: '300px', direction: 'column', gap: '15px', padding: '30px', bgColor: '#ffffff', borderRadius: '8px', borderWidth: '1px', borderColor: '#e2e8f0', borderStyle: 'solid' },
              children: [
                {
                  id: 'form-title',
                  type: 'heading',
                  props: { content: '<h3>Send us a message</h3>', level: 'h3' },
                  children: []
                },
                {
                  id: 'form-name',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm font-medium">Name</p>' },
                  children: []
                },
                {
                  id: 'form-email',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm font-medium">Email</p>' },
                  children: []
                },
                {
                  id: 'form-message',
                  type: 'paragraph',
                  props: { content: '<p class="text-sm font-medium">Message</p>' },
                  children: []
                },
                {
                  id: 'form-btn',
                  type: 'button',
                  props: { label: 'Send Message', bgColor: '#3b82f6', textColor: '#ffffff' },
                  children: []
                },
              ]
            },
            {
              id: 'contact-info',
              type: 'container',
              props: { flex: '1', minWidth: '300px', direction: 'column', gap: '20px', padding: '30px' },
              children: [
                {
                  id: 'info-title',
                  type: 'heading',
                  props: { content: '<h3>Get in touch</h3>', level: 'h3' },
                  children: []
                },
                {
                  id: 'info-email',
                  type: 'paragraph',
                  props: { content: '<p>📧 email@example.com</p>' },
                  children: []
                },
                {
                  id: 'info-phone',
                  type: 'paragraph',
                  props: { content: '<p>📞 +1 (555) 123-4567</p>' },
                  children: []
                },
                {
                  id: 'info-address',
                  type: 'paragraph',
                  props: { content: '<p>📍 123 Main St, City, Country</p>' },
                  children: []
                },
              ]
            },
          ]
        },
      ]
    } as BuilderNode,
  },
];

interface TemplatePickerProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
  onSaveCurrent?: (name: string) => void;
  onDeleteTemplate?: (id: string) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  onSelect,
  onClose,
  onSaveCurrent,
  onDeleteTemplate,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('fursan_templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([...SAMPLE_TEMPLATES, ...parsed]);
      } catch (e) {
        console.error('Failed to parse saved templates:', e);
        setTemplates(SAMPLE_TEMPLATES);
      }
    } else {
      setTemplates(SAMPLE_TEMPLATES);
    }
  }, []);

  const handleSelect = (template: Template) => {
    setSelectedId(template.id);
  };

  const handleApply = () => {
    const template = templates.find((t) => t.id === selectedId);
    if (template) {
      onSelect(template);
    }
  };

  const handleSave = () => {
    if (newTemplateName.trim() && onSaveCurrent) {
      onSaveCurrent(newTemplateName.trim());
      setShowSaveDialog(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this template?')) {
      if (onDeleteTemplate) {
        onDeleteTemplate(id);
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-xl w-3/4 max-w-5xl h-3/4 max-h-[700px] flex flex-col shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <LayoutTemplate size={20} className="text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Page Templates</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Choose a template to start with</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search and Save Button */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Save size={16} />
            Save Current as Template
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutTemplate size={48} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">No templates found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative group ${
                    selectedId === template.id
                      ? 'border-purple-500 bg-slate-800 shadow-md'
                      : 'border-slate-700 hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  {/* Delete button for user-saved templates (not sample templates) */}
                  {!SAMPLE_TEMPLATES.find((t) => t.id === template.id) && onDeleteTemplate && (
                    <button
                      onClick={(e) => handleDelete(e, template.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-900/40"
                      title="Delete template"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  {/* Thumbnail */}
                  <div className="text-4xl mb-3 text-center p-4 bg-slate-950/50 rounded-lg">
                    {template.thumbnail}
                  </div>

                  {/* Template Info */}
                  <div className="font-medium text-sm text-white">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</div>
                  )}

                  {/* Selected indicator */}
                  {selectedId === template.id && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                      <CheckCheck size={14} />
                    </div>
                  )}

                  {/* Hover preview overlay */}
                  {hoveredId === template.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {selectedId ? 'Template selected' : 'Select a template to apply'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedId}
              className={`px-6 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-colors ${
                selectedId
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-slate-600 cursor-not-allowed'
              }`}
            >
              <CheckCheck size={16} />
              Apply Template
            </button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-slate-900 rounded-xl p-6 w-96 shadow-2xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Save as Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Description (optional)</label>
                <textarea
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Describe this template..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewTemplateName('');
                  setNewTemplateDesc('');
                }}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newTemplateName.trim()}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors ${
                  newTemplateName.trim()
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
