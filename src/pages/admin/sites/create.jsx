import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sitesApi } from '../../../api/sites';

const CreateSite = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    is_active: true,
    is_default: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sitesApi.create(formData);
      navigate('/admin/sites');
    } catch (error) {
      console.error('Failed to create site:', error);
      alert('Failed to create site');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Create Site</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
            placeholder="e.g., webcom"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            id="is_active"
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_default"
            checked={formData.is_default}
            onChange={handleChange}
            id="is_default"
            className="rounded"
          />
          <label htmlFor="is_default" className="text-sm text-slate-300">Set as Default Site</label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Site'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/sites')}
            className="px-6 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSite;
