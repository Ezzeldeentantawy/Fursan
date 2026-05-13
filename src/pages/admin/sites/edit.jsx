import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sitesApi } from '../../../api/sites';

const EditSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    is_active: true,
    is_default: false,
  });
  const [globalCss, setGlobalCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [cssSuccess, setCssSuccess] = useState(false);

  useEffect(() => {
    loadSite();
  }, [id]);

  const loadSite = async () => {
    try {
      const res = await sitesApi.get(id);
      const site = res.data.data || res.data;
      setFormData({
        name: site.name,
        domain: site.domain,
        is_active: site.is_active,
        is_default: site.is_default,
      });
      setGlobalCss(site.global_css || '');
    } catch (error) {
      console.error('Failed to load site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sitesApi.update(id, formData);
      setGeneralSuccess(true);
      setTimeout(() => setGeneralSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update site:', error);
      alert('Failed to update site');
    } finally {
      setSaving(false);
    }
  };

  const handleCssSave = async () => {
    setSaving(true);
    try {
      await sitesApi.update(id, { global_css: globalCss });
      setCssSuccess(true);
      setTimeout(() => setCssSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save global CSS:', error);
      alert('Failed to save global CSS');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-300">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Edit Site</h2>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-700">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${activeTab === 'general' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-300'}`}>General</button>
        <button onClick={() => setActiveTab('global-css')} className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${activeTab === 'global-css' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-300'}`}>Global CSS</button>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="max-w-2xl bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
            <input type="text" name="domain" value={formData.domain} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} id="is_active" className="rounded" />
            <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} id="is_default" className="rounded" />
            <label htmlFor="is_default" className="text-sm text-slate-300">Set as Default Site</label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/admin/sites')} className="px-6 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600">
              Cancel
            </button>
            {generalSuccess && <span className="text-green-400 text-sm">✓ Saved successfully</span>}
          </div>
        </form>
      )}

      {activeTab === 'global-css' && (
        <div className="max-w-2xl bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Global CSS</label>
            <p className="text-xs text-slate-500 mb-3">This CSS will apply to all pages of this website. Use it to define site-wide styles, custom fonts, or global overrides.</p>
            <textarea
              value={globalCss}
              onChange={(e) => setGlobalCss(e.target.value)}
              className="w-full h-96 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder="/* Enter your global CSS here */
body {
  font-family: 'Custom Font', sans-serif;
}

.site-header {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCssSave} disabled={saving} className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save CSS'}
            </button>
            {cssSuccess && <span className="text-green-400 text-sm">✓ CSS saved successfully</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSite;
