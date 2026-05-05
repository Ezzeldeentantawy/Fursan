import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { pagesApi } from '../../api/pagesApi';
import { mediaApi } from '../../api/media';
import { sitesApi } from '../../api/sites';

const SiteAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPages: 0,
    totalMedia: 0,
  });
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteName, setSiteName] = useState('');

  // Get current user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const siteId = user?.site_id;

  useEffect(() => {
    if (siteId) {
      fetchDashboardData();
    } else {
      setError('No site assigned to your account');
      setLoading(false);
    }
  }, [siteId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch site details
      if (siteId) {
        try {
          const siteRes = await sitesApi.get(siteId);
          const siteData = siteRes.data || siteRes;
          setSiteName(siteData.name || 'Your Site');
        } catch (err) {
          console.error('Error fetching site:', err);
        }
      }

      // Fetch pages for this site
      const pagesRes = await pagesApi.getAll({ site_id: siteId });
      const pagesData = pagesRes.data?.data || pagesRes.data || pagesRes;
      const pagesArray = Array.isArray(pagesData) ? pagesData : [];
      
      setStats(prev => ({ ...prev, totalPages: pagesArray.length }));
      
      // Get recent pages (last 5)
      const sortedPages = pagesArray
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);
      setRecentPages(sortedPages);

      // Fetch media count
      try {
        const mediaRes = await mediaApi.getAll({ per_page: 100 });
        const mediaData = mediaRes.data?.data || mediaRes.data || mediaRes;
        const mediaArray = Array.isArray(mediaData) ? mediaData : [];
        setStats(prev => ({ ...prev, totalMedia: mediaArray.length }));
      } catch (err) {
        console.error('Error fetching media:', err);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {siteName} Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Manage your site content</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Pages</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalPages}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Media</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalMedia}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Image className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pages */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} />
            Recent Pages
          </h2>
        </div>
        <div className="p-6">
          {recentPages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pages yet</p>
          ) : (
            <div className="space-y-4">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{page.title}</p>
                    <p className="text-sm text-gray-500">{page.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      <Clock size={12} className="inline mr-1" />
                      {formatDate(page.updated_at)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteAdminDashboard;
