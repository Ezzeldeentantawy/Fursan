import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pagesApi } from '../../../api/pagesApi';
import { Pencil, Hammer, ArrowLeft, Save, Globe, FileText, Loader2, Check } from 'lucide-react';

const PageEditMetadata = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    title_ar: '',
    slug: '',
    meta_title: '',
    meta_title_ar: '',
    meta_description: '',
    meta_description_ar: '',
    keywords: [],
    is_published: false,
    is_home: false,
  });

  const [keywordInput, setKeywordInput] = useState('');

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await pagesApi.getOne(id);
      const page = res.data?.data || res.data;
      setForm({
        title: page.title_en || page.title || '',
        title_ar: page.title_ar || '',
        slug: page.slug || '',
        meta_title: page.meta_title_en || page.meta_title || '',
        meta_title_ar: page.meta_title_ar || '',
        meta_description: page.meta_description_en || page.meta_description || '',
        meta_description_ar: page.meta_description_ar || '',
        keywords: Array.isArray(page.keywords) ? page.keywords : [],
        is_published: !!page.is_published,
        is_home: !!page.is_home,
      });
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Failed to load page data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.keywords.includes(kw)) {
      handleChange('keywords', [...form.keywords, kw]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw) => {
    handleChange('keywords', form.keywords.filter((k) => k !== kw));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const payload = {
        title: form.title,
        title_ar: form.title_ar || null,
        slug: form.slug,
        meta_title: form.meta_title || null,
        meta_title_ar: form.meta_title_ar || null,
        meta_description: form.meta_description || null,
        meta_description_ar: form.meta_description_ar || null,
        keywords: form.keywords.length > 0 ? form.keywords : null,
        is_published: form.is_published,
        is_home: form.is_home,
      };

      await pagesApi.update(id, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving page:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading page data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/pages')}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Back to pages"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText size={24} className="text-blue-400" />
                Edit Page Metadata
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {form.title || 'Untitled'} — <span className="text-slate-500">/{form.slug}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/admin/pages/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Hammer size={16} />
            Edit with Builder
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-800 rounded-xl text-emerald-300 flex items-center gap-3">
            <Check size={18} className="text-emerald-400" />
            Page metadata saved successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              Title & Slug
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-blue-400">(EN)</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Page title in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-emerald-400">(AR)</span>
                </label>
                <input
                  type="text"
                  value={form.title_ar}
                  onChange={(e) => handleChange('title_ar', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
                  dir="rtl"
                  placeholder="عنوان الصفحة بالعربية"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
                placeholder="page-url-slug"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-generated from title if left empty.</p>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Pencil size={18} className="text-purple-400" />
              SEO Metadata
            </h2>
            
            {/* Meta Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Meta Title <span className="text-blue-400">(EN)</span>
                </label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="SEO title in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Meta Title <span className="text-emerald-400">(AR)</span>
                </label>
                <input
                  type="text"
                  value={form.meta_title_ar}
                  onChange={(e) => handleChange('meta_title_ar', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-right"
                  dir="rtl"
                  placeholder="عنوان تحسين محركات البحث بالعربية"
                />
              </div>
            </div>

            {/* Meta Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Meta Description <span className="text-blue-400">(EN)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="SEO description in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Meta Description <span className="text-emerald-400">(AR)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.meta_description_ar}
                  onChange={(e) => handleChange('meta_description_ar', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none text-right"
                  dir="rtl"
                  placeholder="وصف تحسين محركات البحث بالعربية"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Type a keyword and press Enter"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {form.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No keywords added yet.</p>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => handleChange('is_published', !form.is_published)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.is_published ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                      form.is_published ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className="text-sm text-slate-300">Published</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => handleChange('is_home', !form.is_home)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.is_home ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                      form.is_home ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className="text-sm text-slate-300">Home Page</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/pages')}
              className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageEditMetadata;
