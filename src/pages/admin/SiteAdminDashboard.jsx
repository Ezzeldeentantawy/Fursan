import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image,
  Clock,
  Eye,
  EyeOff,
  Home,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { pagesApi } from '../../api/pagesApi';
import { mediaApi } from '../../api/media';
import { sitesApi } from '../../api/sites';
import { statsApi } from '../../api/statsApi';

const SiteAdminDashboard = () => {
  const [stats, setStats] = useState({
    pages_count: 0,
    published_pages_count: 0,
    draft_pages_count: 0,
    media_count: 0,
    site_name: '',
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

      // Fetch site stats from API
      try {
        const statsData = await statsApi.getSiteStats();
        console.log('Site stats received:', statsData);
        setStats(prev => ({
          ...prev,
          pages_count: statsData.pages_count || 0,
          published_pages_count: statsData.published_pages_count || 0,
          draft_pages_count: statsData.draft_pages_count || 0,
          media_count: statsData.media_count || 0,
          site_name: statsData.site_name || '',
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

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
      
      // Get recent pages (last 5)
      const sortedPages = pagesArray
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);
      setRecentPages(sortedPages);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  // Main stat cards
  const mainStatCards = [
    { 
      title: 'Total Pages', 
      value: stats.pages_count, 
      icon: FileText, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      lightColor: 'bg-green-100',
    },
    { 
      title: 'Media Files', 
      value: stats.media_count, 
      icon: Image, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      lightColor: 'bg-yellow-100',
    },
  ];

  // Detailed page stats
  const pageStatCards = [
    { 
      title: 'Published', 
      value: stats.published_pages_count, 
      icon: Eye, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      title: 'Drafts', 
      value: stats.draft_pages_count, 
      icon: EyeOff, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with better visibility */}
      <div className="mb-8 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <BarChart3 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {siteName || 'Site'} Dashboard
              </h1>
              <p className="text-green-100 text-lg">
                Manage your site content and track performance.
              </p>
            </div>
          </div>
          {/* Right side - date display */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/80 text-sm">Today</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <div className="p-1 bg-red-200 rounded">
            <Activity size={16} className="text-red-600" />
          </div>
          {error}
        </div>
      )}

      {/* Main Stats Cards - Wider layout for site admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
        {mainStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`${stat.lightColor} p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className={stat.textColor} size={28} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-1.5 bg-gradient-to-r ${stat.color} group-hover:h-2 transition-all`}></div>
            </div>
          );
        })}
      </div>

      {/* Page Stats Detail */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-gray-600" />
          Page Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageStatCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-white/50`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white/70 shadow-sm`}>
                    <Icon className={stat.textColor} size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Pages */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText size={20} className="text-green-600" />
              </div>
              Recent Pages
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {recentPages.length} items
            </span>
          </div>
        </div>
        <div className="p-6">
          {recentPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pages yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first page to see it here</p>
              <a href="/admin/pages" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus size={16} />
                Create Page
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${page.is_published ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {page.is_published ? 
                        <Eye size={16} className="text-green-600" /> : 
                        <EyeOff size={16} className="text-gray-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{page.title}</p>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(page.updated_at)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
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

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-green-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/pages" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow group">
            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
              <FileText size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create New Page</p>
              <p className="text-sm text-gray-500">Build with drag & drop</p>
            </div>
          </a>
          <a href="/admin/media" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow group">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:scale-110 transition-transform">
              <Image size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload Media</p>
              <p className="text-sm text-gray-500">Images & files</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SiteAdminDashboard;
