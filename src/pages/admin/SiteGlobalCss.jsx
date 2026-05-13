import { useState, useEffect } from 'react';
import { sitesApi } from '../../api/sites';

const SiteGlobalCss = () => {
  const [globalCss, setGlobalCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Get current user's site_id
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const siteId = user?.site_id;

  useEffect(() => {
    if (!siteId) {
      setError('No site assigned to your account');
      setLoading(false);
      return;
    }
    loadCss();
  }, [siteId]);

  const loadCss = async () => {
    try {
      const res = await sitesApi.getGlobalCss(siteId);
      const data = res.data || res;
      setGlobalCss(data.global_css || '');
    } catch (err) {
      console.error('Failed to load global CSS:', err);
      setError('Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await sitesApi.updateGlobalCss(siteId, globalCss);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save global CSS:', err);
      alert('Failed to save global CSS');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-300">Loading...</div>;

  if (error) return (
    <div className="p-6">
      <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300">{error}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Global CSS</h1>
        <p className="text-slate-400">Define site-wide CSS styles that apply to all pages of your website.</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Custom CSS</label>
          <p className="text-xs text-slate-500 mb-3">This CSS will apply to all pages. Use it for custom fonts, global overrides, or consistent styling across your entire site.</p>
          <textarea
            value={globalCss}
            onChange={(e) => setGlobalCss(e.target.value)}
            className="w-full h-96 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
            placeholder="/* Enter your global CSS here */"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save CSS'}
          </button>
          {success && <span className="text-green-400 text-sm">✓ CSS saved successfully</span>}
        </div>
      </div>
    </div>
  );
};

export default SiteGlobalCss;
