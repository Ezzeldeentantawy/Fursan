import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Settings } from 'lucide-react';
import { sitesApi } from '../../../api/sites';
import SiteSettingsModal from '../../../components/admin/sites/SiteSettingsModal';

const SitesList = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsSite, setSettingsSite] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await sitesApi.list({ include: 'favicon' });
      const data = res.data.data || res.data;
      setSites(data || []);
    } catch (error) {
      console.error('Failed to load sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    try {
      await sitesApi.delete(id);
      loadSites();
    } catch (error) {
      console.error('Failed to delete site:', error);
    }
  };

  const handleToggleDefault = async (id) => {
    try {
      await sitesApi.toggleDefault(id);
      loadSites();
    } catch (error) {
      console.error('Failed to toggle default:', error);
    }
  };

  const openSettingsModal = (site) => {
    setSettingsSite(site);
    setIsSettingsModalOpen(true);
  };

  const handleSettingsSave = () => {
    setIsSettingsModalOpen(false);
    setSettingsSite(null);
    loadSites();
  };

  if (loading) return <div className="text-slate-300">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Sites</h2>
        <Link
          to="/admin/sites/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Site
        </Link>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Default</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 text-sm text-white">{site.name}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{site.domain}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    site.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {site.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {site.is_default ? (
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  ) : (
                    <button
                      onClick={() => handleToggleDefault(site.id)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Set Default
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openSettingsModal(site)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                      title="Site Settings"
                    >
                      <Settings size={14} />
                    </button>
                    <Link
                      to={`/admin/sites/${site.id}/edit`}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(site.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SiteSettingsModal
        site={settingsSite}
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSettingsSite(null);
        }}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default SitesList;
