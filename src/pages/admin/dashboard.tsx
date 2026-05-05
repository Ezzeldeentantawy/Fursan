import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  FileText, 
  Users, 
  Image,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';
import { statsApi } from '../../api/statsApi';
import { pagesApi } from '../../api/pagesApi';
import { usersApi } from '../../api/usersApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    sites_count: 0,
    pages_count: 0,
    users_count: 0,
    media_count: 0,
  });
  const [recentPages, setRecentPages] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats based on user role
      if (isSuperAdmin) {
        const statsData = await statsApi.getStats();
        setStats(statsData);
      } else {
        const statsData = await statsApi.getSiteStats();
        setStats({
          ...statsData,
          sites_count: 0,
          users_count: 0,
        });
      }

      // Fetch recent pages
      const pagesRes = await pagesApi.getAll();
      const pagesData = pagesRes.data?.data || pagesRes.data || pagesRes;
      const pagesArray = Array.isArray(pagesData) ? pagesData : [];
      const sortedPages = pagesArray
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);
      setRecentPages(sortedPages);

      // Fetch recent users (only for super_admin)
      if (isSuperAdmin) {
        const usersRes = await usersApi.list();
        const usersData = usersRes.data?.data || usersRes.data || usersRes;
        const usersArray = Array.isArray(usersData) ? usersData : [];
        const sortedUsers = usersArray
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentUsers(sortedUsers);
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

  const statCards = [
    ...(isSuperAdmin ? [{ 
      title: 'Total Sites', 
      value: stats.sites_count, 
      icon: Globe, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }] : []),
    { 
      title: 'Total Pages', 
      value: stats.pages_count, 
      icon: FileText, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    ...(isSuperAdmin ? [{ 
      title: 'Total Users', 
      value: stats.users_count, 
      icon: Users, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }] : []),
    { 
      title: 'Total Media', 
      value: stats.media_count, 
      icon: Image, 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Fursan CMS Admin Panel</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg shadow p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pages */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} />
                Recent Pages
              </h2>
            </div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users - Only for super_admin */}
        {isSuperAdmin && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} />
                  Recent Users
                </h2>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' : 'Site Admin'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;