import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Hammer, Trash2, Loader2, Plus, Search, FileType, PanelTop, PanelBottom, X, CheckCheck } from 'lucide-react';
import { templatesApi } from '../../../api/templatesApi';
import { sitesApi } from '../../../api/sites';

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

const TYPE_ICONS: Record<string, React.ReactNode> = {
  block:  <FileType size={14} />,
  header: <PanelTop size={14} />,
  footer: <PanelBottom size={14} />,
};

/**
 * TemplatesIndex Component
 * Admin page for managing templates — listing, creating, editing metadata, and deleting
 */
const TemplatesIndex: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'header' | 'footer' | 'block'>('block');
  const [creating, setCreating] = useState(false);

  // Edit modal state
  const [editTemplate, setEditTemplate] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'header' | 'footer' | 'block'>('block');
  const [editSiteId, setEditSiteId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Initialize sites and default site filter
  useEffect(() => {
    const init = async () => {
      try {
        const sitesRes = await sitesApi.list();
        // Unwrap: Axios response -> JsonResource wrapper -> actual data
        const sitesData = sitesRes.data?.data || sitesRes.data;
        setSites(sitesData || []);

        const defaultRes = await sitesApi.getDefault();
        // Unwrap: Axios response -> JsonResource wrapper -> actual data
        const defaultSite = defaultRes.data?.data || defaultRes.data;
        if (defaultSite?.id) {
          setSelectedSiteId(defaultSite.id.toString());
        }
      } catch (error) {
        console.error('Failed to initialize sites:', error);
      }
    };
    init();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedSiteId) params.site_id = selectedSiteId;
      const res = await templatesApi.getAll(params);
      // Unwrap: Axios response -> JsonResource wrapper -> actual data
      const data = res.data?.data || res.data;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when site filter or debounced search changes
  useEffect(() => {
    fetchTemplates();
  }, [selectedSiteId, debouncedSearch]);

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

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await templatesApi.delete(id);
      // Refresh the list after deletion
      await fetchTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(`Failed to delete template: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // --- Edit Modal Handlers ---

  const handleEditOpen = (template: any) => {
    setEditTemplate(template);
    setEditTitle(template.title || '');
    setEditType(template.type || 'block');
    setEditSiteId(template.site_id?.toString() || '');
  };

  const handleEditClose = () => {
    setEditTemplate(null);
    setEditTitle('');
    setEditType('block');
    setEditSiteId('');
    setSavingEdit(false);
  };

  const handleEditSave = async () => {
    if (!editTemplate || !editTitle.trim() || savingEdit) return;

    try {
      setSavingEdit(true);
      const payload: any = {
        title: editTitle.trim(),
        type: editType,
      };
      if (editSiteId) {
        payload.site_id = parseInt(editSiteId, 10);
      }
      const res = await templatesApi.update(editTemplate.id, payload);
      // Unwrap: Axios response -> JsonResource wrapper -> actual data
      const updated = res.data?.data || res.data;
      // Update local state directly instead of refetching all templates
      setTemplates((prev) =>
        prev.map((t) => (t.id === editTemplate.id ? { ...t, ...updated } : t))
      );
      handleEditClose();
    } catch (err: any) {
      console.error('Error updating template:', err);
      alert(`Failed to update template: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // --- Create Dialog Handlers ---

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await templatesApi.create({
        title: newName.trim(),
        type: newType,
        content: { elements: [] },
      });
      // Unwrap: Axios response -> JsonResource wrapper -> actual data
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

  // --- Loading State ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-slate-400">Loading templates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Templates Management</h1>
          <div className="flex items-center gap-4">
            {/* Search input with button */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search templates..."
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
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

            {/* Site Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Filter by Site:</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              >
                <option value="">All Sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} {site.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* New Template Button */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Template
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading templates</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchTemplates}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Templates Table */}
        {!error && (
          <div className="bg-slate-900 shadow rounded-lg overflow-hidden">
            {templates.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12 px-4">
                <svg
                  className="mx-auto h-12 w-12 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No templates yet</h3>
                <p className="mt-1 text-sm text-slate-400">Get started by creating a new template.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus size={20} className="mr-2" />
                    Create New Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-700">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {template.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleEditOpen(template)}
                            className="text-sm font-medium text-purple-400 hover:text-purple-400 hover:underline text-left"
                          >
                            {template.title || 'Untitled'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_COLORS[template.type] || 'bg-slate-700 text-slate-300'}`}>
                            {TYPE_ICONS[template.type]}
                            {TYPE_LABELS[template.type] || template.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {template.site_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(template.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-1.5">
                            {/* Edit Metadata (Pencil) */}
                            <button
                              onClick={() => handleEditOpen(template)}
                              className="p-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                              title="Edit Metadata"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Edit with Builder (Hammer) */}
                            <button
                              onClick={() => navigate(`/admin/templates/${template.id}/edit`)}
                              className="p-2 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                              title="Edit with Builder"
                            >
                              <Hammer size={16} />
                            </button>

                            {/* Delete (Trash) */}
                            <button
                              onClick={() => handleDelete(template.id, template.title || 'Untitled')}
                              disabled={deleteLoading === template.id}
                              className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteLoading === template.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Template Dialog (preserved from original) */}
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

      {/* Edit Template Modal */}
      {editTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleEditClose}>
          <div className="bg-slate-900 rounded-xl p-6 w-96 shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Template</h3>
              <button onClick={handleEditClose} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Template Name</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Main Header, Hero Block, Footer"
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Template Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['block', 'header', 'footer'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEditType(type)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                        editType === type
                          ? 'border-purple-500 bg-slate-800 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {TYPE_ICONS[type]}
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                {editType !== 'block' && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Only one {editType} per site is allowed. Creating this will demote the existing one.
                  </p>
                )}
              </div>

              {/* Site */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Site</label>
                <select
                  value={editSiteId}
                  onChange={(e) => setEditSiteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} {site.is_default ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editTitle.trim() || savingEdit}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-colors ${
                  editTitle.trim() && !savingEdit
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-slate-600 cursor-not-allowed'
                }`}
              >
                {savingEdit ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <><CheckCheck size={14} /> Save</>
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
