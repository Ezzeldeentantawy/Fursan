import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templatesApi } from '../../../api/templatesApi';
import { Loader2, LayoutTemplate, FileType, PanelTop, PanelBottom, Edit3, Trash2, Plus, X, CheckCheck, Search } from 'lucide-react';

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

const TYPE_ORDER: Record<string, number> = {
  header: 0,
  block: 1,
  footer: 2,
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  block:  <FileType size={14} />,
  header: <PanelTop size={14} />,
  footer: <PanelBottom size={14} />,
};

const TemplatesIndex: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'header' | 'footer' | 'block'>('block');
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await templatesApi.getAll(params);
      const data = res.data?.data || [];
      data.sort((a: any, b: any) => (TYPE_ORDER[a.type] ?? 1) - (TYPE_ORDER[b.type] ?? 1));
      setTemplates(data);
    } catch (err) {
      console.error('[Templates] Failed to fetch:', err);
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search — 3-second auto-search after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [debouncedSearch]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this template permanently?')) return;
    try {
      await templatesApi.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('[Templates] Failed to delete:', err);
      alert('Failed to delete template.');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await templatesApi.create({
        title: newName.trim(),
        type: newType,
        content: { elements: [] },
      });
      const newTemplate = res.data?.data || res.data;
      setShowCreateDialog(false);
      setNewName('');
      setNewType('block');
      // Navigate to the builder for this new template
      navigate(`/admin/templates/${newTemplate.id}/edit`);
    } catch (err) {
      console.error('[Templates] Failed to create:', err);
      alert('Failed to create template.');
    } finally {
      setCreating(false);
    }
  };

  const grouped = {
    header: templates.filter((t) => t.type === 'header'),
    block: templates.filter((t) => t.type === 'block'),
    footer: templates.filter((t) => t.type === 'footer'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutTemplate size={24} className="text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Templates</h1>
            <p className="text-xs text-slate-400">Manage header, footer, and block templates</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {/* Search bar with button */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search templates by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          title="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchTemplates} className="text-red-300 text-xs underline mt-1">Retry</button>
        </div>
      )}

      {!error && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <LayoutTemplate size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No templates yet</p>
          <p className="text-xs">Click "New Template" to create your first template.</p>
        </div>
      )}

      {(Object.entries(grouped) as [string, any[]][]).map(([type, items]) => {
        if (items.length === 0 && type !== 'header' && type !== 'footer') return null;
        return (
          <div key={type} className="mb-8">
            {(items.length > 0 || type === 'header' || type === 'footer') && (
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                {TYPE_ICONS[type]}
                {TYPE_LABELS[type] || type}
                {type !== 'block' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${items.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                    {items.length > 0 ? 'Active' : 'None'}
                  </span>
                )}
              </h2>
            )}
            {items.length === 0 ? (
              <p className="text-xs text-slate-600 ml-6 mb-4">
                No {type} template. Create one using the "New Template" button.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((template) => {
                  const content = template.content;
                  const hasElements = content
                    ? Array.isArray(content)
                      ? content.length > 0
                      : content.elements && content.elements.length > 0
                    : false;
                  const elementCount = content
                    ? Array.isArray(content)
                      ? content.length
                      : content.elements?.length || 0
                    : 0;
                  return (
                    <div
                      key={template.id}
                      onClick={() => navigate(`/admin/templates/${template.id}/edit`)}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 hover:bg-slate-750 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_COLORS[template.type] || 'bg-slate-700 text-slate-300'}`}>
                          {TYPE_ICONS[template.type]}
                          {TYPE_LABELS[template.type] || template.type}
                        </span>
                        <button
                          onClick={(e) => handleDelete(template.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                          title="Delete template"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h3 className="text-white font-medium text-sm mb-1">{template.title}</h3>
                      <p className="text-xs text-slate-500">
                        {hasElements ? `${elementCount} element(s)` : 'Empty'}
                        {' · '}
                        {template.is_published ? 'Published' : 'Draft'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Edit3 size={12} className="text-purple-400" />
                        <span className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit with builder
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-slate-900 rounded-xl p-6 w-96 shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Template</h3>
              <button onClick={() => setShowCreateDialog(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Main Header, Hero Block, Footer"
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
                      onClick={() => setNewType(type)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                        newType === type
                          ? 'border-purple-500 bg-slate-800 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {TYPE_ICONS[type]}
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                {newType !== 'block' && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Only one {newType} per site is allowed. Creating this will demote the existing one.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-colors ${
                  newName.trim() && !creating
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                {creating ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating...</>
                ) : (
                  <><CheckCheck size={14} /> Create & Edit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesIndex;
