import React, { useState, useEffect } from 'react';
import { LayoutTemplate, X, Search, CheckCheck, Save, Trash2, FileType, PanelTop, PanelBottom } from 'lucide-react';
import templatesApi from '../../api/templatesApi';

export interface ApiTemplate {
  id: number;
  title: string;
  content: { elements: any[] } | null;
  type: 'header' | 'footer' | 'block';
  site_id: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplatePickerProps {
  siteId: number;
  onSelect: (content: { elements: any[] }) => void;
  onClose: () => void;
  onSaveCurrent?: (name: string, type: 'header' | 'footer' | 'block') => void;
  onDeleteTemplate?: (id: number) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  block:  <FileType size={14} />,
  header: <PanelTop size={14} />,
  footer: <PanelBottom size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  block:  'bg-blue-500/20 text-blue-400',
  header: 'bg-purple-500/20 text-purple-400',
  footer: 'bg-green-500/20 text-green-400',
};

const TYPE_LABELS: Record<string, string> = {
  block:  'Block',
  header: 'Header',
  footer: 'Footer',
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  siteId,
  onSelect,
  onClose,
  onSaveCurrent,
  onDeleteTemplate,
}) => {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState<'header' | 'footer' | 'block'>('block');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'header' | 'footer' | 'block'>('all');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from backend on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await templatesApi.getBySite(siteId);
        const data = res.data?.data || [];
        setTemplates(data);
      } catch (err) {
        console.error('[TemplatePicker] Failed to fetch templates:', err);
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [siteId]);

  const handleSelect = (template: ApiTemplate) => {
    setSelectedId(template.id);
  };

  const handleApply = () => {
    const template = templates.find((t) => t.id === selectedId);
    if (template && template.content) {
      onSelect(template.content);
    }
  };

  const handleSave = () => {
    if (newTemplateName.trim() && onSaveCurrent) {
      onSaveCurrent(newTemplateName.trim(), newTemplateType);
      setShowSaveDialog(false);
      setNewTemplateName('');
      setNewTemplateType('block');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await templatesApi.delete(id);
      if (onDeleteTemplate) onDeleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error('[TemplatePicker] Failed to delete template:', err);
      alert('Failed to delete template.');
    }
  };

  const filtered = templates
    .filter((t) => typeFilter === 'all' || t.type === typeFilter)
    .filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

  const typeCounts = {
    all: templates.length,
    block: templates.filter((t) => t.type === 'block').length,
    header: templates.filter((t) => t.type === 'header').length,
    footer: templates.filter((t) => t.type === 'footer').length,
  };

  const TABS = [
    { key: 'all' as const, label: 'All', count: typeCounts.all },
    { key: 'block' as const, label: 'Blocks', count: typeCounts.block },
    { key: 'header' as const, label: 'Headers', count: typeCounts.header },
    { key: 'footer' as const, label: 'Footers', count: typeCounts.footer },
  ];

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
              <h2 className="text-lg font-semibold text-white">Template Library</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Choose a template to insert into the page
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search, Type Filter, Save Button */}
        <div className="p-4 border-b border-slate-700 flex flex-col gap-3">
          <div className="flex items-center gap-3">
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
              className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Save size={16} />
              Save Current as Template
            </button>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  typeFilter === tab.key
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutTemplate size={48} className="mb-3 animate-pulse opacity-50" />
              <p className="text-sm font-medium">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Reload
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutTemplate size={48} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">No templates found</p>
              <p className="text-xs">
                {search ? 'Try a different search term' : 'Create a template to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((template) => {
                const hasContent = template.content && template.content.elements && template.content.elements.length > 0;
                return (
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
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, template.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-900/40 z-10"
                      title="Delete template"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Thumbnail / Type icon */}
                    <div className="text-4xl mb-3 text-center p-4 bg-slate-950/50 rounded-lg flex items-center justify-center">
                      {TYPE_ICONS[template.type] || <FileType size={32} className="text-slate-500" />}
                    </div>

                    {/* Type badge */}
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_COLORS[template.type] || 'bg-slate-700 text-slate-300'}`}>
                        {TYPE_ICONS[template.type]}
                        {TYPE_LABELS[template.type] || template.type}
                      </span>
                    </div>

                    {/* Template Info */}
                    <div className="font-medium text-sm text-white truncate">{template.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {hasContent
                        ? `${template.content.elements.length} element(s)`
                        : 'Empty template'}
                    </div>

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
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {selectedId
              ? 'Template selected — elements will be inserted into the page'
              : 'Select a template to insert its elements'}
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
              Insert Template
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
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Template Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['block', 'header', 'footer'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewTemplateType(type)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                        newTemplateType === type
                          ? 'border-purple-500 bg-slate-800 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {TYPE_ICONS[type]}
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                {newTemplateType !== 'block' && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Only one {newTemplateType} per site is allowed. Saving will demote the existing one.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewTemplateName('');
                  setNewTemplateType('block');
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

export default TemplatePicker;
