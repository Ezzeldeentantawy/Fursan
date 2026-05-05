import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FileText, 
  Users, 
  Image,
  Clock,
  Eye,
  EyeOff,
  Home,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { statsApi } from '../../api/statsApi';
import { pagesApi } from '../../api/pagesApi';
import { usersApi } from '../../api/usersApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    sites_count: 0,
    pages_count: 0,
    published_pages_count: 0,
    draft_pages_count: 0,
    home_pages_count: 0,
    media_count: 0,
    users_count: 0,
    super_admins_count: 0,
    site_admins_count: 0,
  });
  const [recentPages, setRecentPages] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Debug: Log user info
  console.log('Dashboard - User from localStorage:', user);
  console.log('Dashboard - isSuperAdmin:', isSuperAdmin);
  console.log('Dashboard - User role:', user?.role);
  
  // If user data is missing or invalid, try to fetch from API
  useEffect(() => {
    if (!user || !user.role) {
      console.warn('Dashboard - No valid user data in localStorage, fetching from API...');
      const fetchUser = async () => {
        try {
          const res = await api.get('/api/v1/user');
          const userData = res.data?.data || res.data;
          if (userData && userData.role) {
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Dashboard - Updated user from API:', userData);
            window.location.reload(); // Reload to update isSuperAdmin
          }
        } catch (err) {
          console.error('Dashboard - Failed to fetch user:', err);
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats based on user role
      if (isSuperAdmin) {
        try {
          const statsData = await statsApi.getStats();
          console.log('Stats data received:', statsData); // Debug log
          if (statsData && typeof statsData === 'object') {
            setStats(statsData);
          } else {
            console.error('Invalid stats data format:', statsData);
            setError('Invalid stats data received from server');
          }
        } catch (statsErr) {
          console.error('Error fetching stats:', statsErr);
          setError('Failed to load stats. Please check your connection and try again.');
        }
      } else {
        try {
          const statsData = await statsApi.getSiteStats();
          console.log('Site stats data received:', statsData); // Debug log
          if (statsData && typeof statsData === 'object') {
            setStats({
              ...statsData,
              sites_count: 0,
              users_count: 0,
              super_admins_count: 0,
              site_admins_count: 0,
              home_pages_count: 0,
            });
          } else {
            console.error('Invalid site stats data format:', statsData);
          }
        } catch (statsErr) {
          console.error('Error fetching site stats:', statsErr);
        }
      }

      // Fetch recent pages
      try {
        const pagesRes = await pagesApi.getAll();
        const pagesData = pagesRes.data?.data || pagesRes.data || pagesRes;
        const pagesArray = Array.isArray(pagesData) ? pagesData : [];
        const sortedPages = pagesArray
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5);
        setRecentPages(sortedPages);
      } catch (pagesErr) {
        console.error('Error fetching pages:', pagesErr);
      }

      // Fetch recent users (only for super_admin)
      if (isSuperAdmin) {
        try {
          const usersRes = await usersApi.list();
          const usersData = usersRes.data?.data || usersRes.data || usersRes;
          const usersArray = Array.isArray(usersData) ? usersData : [];
          const sortedUsers = usersArray
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setRecentUsers(sortedUsers);
        } catch (usersErr) {
          console.error('Error fetching users:', usersErr);
        }
      }

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
    ...(isSuperAdmin ? [{ 
      title: 'Total Sites', 
      value: stats.sites_count, 
      icon: Globe, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      lightColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'up'
    }] : []),
    { 
      title: 'Total Pages', 
      value: stats.pages_count, 
      icon: FileText, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      lightColor: 'bg-green-100',
      change: '+5%',
      changeType: 'up'
    },
    ...(isSuperAdmin ? [{ 
      title: 'Total Users', 
      value: stats.users_count, 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      lightColor: 'bg-purple-100',
      change: '+3%',
      changeType: 'up'
    }] : []),
    { 
      title: 'Media Files', 
      value: stats.media_count, 
      icon: Image, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      lightColor: 'bg-yellow-100',
      change: '+18%',
      changeType: 'up'
    },
  ];

  // Detailed page stats
  const pageStatCards = isSuperAdmin ? [
    { 
      title: 'Published Pages', 
      value: stats.published_pages_count, 
      icon: Eye, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      title: 'Draft Pages', 
      value: stats.draft_pages_count, 
      icon: EyeOff, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      title: 'Home Pages', 
      value: stats.home_pages_count, 
      icon: Home, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
  ] : [];

  // User role stats (super admin only)
  const userRoleCards = isSuperAdmin ? [
    { 
      title: 'Super Admins', 
      value: stats.super_admins_count, 
      icon: Sparkles, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    { 
      title: 'Site Admins', 
      value: stats.site_admins_count, 
      icon: Users, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with better visibility */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <BarChart3 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Welcome back! Here's what's happening with your CMS.
              </p>
            </div>
          </div>
          {/* Right side - can add additional info or actions here */}
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

      {/* Main Stats Cards - Dynamic grid based on number of cards */}
      <div className={`grid gap-6 mb-8 ${
        mainStatCards.length === 1 ? 'grid-cols-1 max-w-lg' :
        mainStatCards.length === 2 ? 'grid-cols-1 md:grid-cols-2 md:max-w-4xl mx-auto' :
        mainStatCards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {mainStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`${stat.lightColor} p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className={stat.textColor} size={28} />
                  </div>
                  {stat.change && (
                    <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
                      stat.changeType === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {stat.changeType === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`h-1.5 bg-gradient-to-r ${stat.color} group-hover:h-2 transition-all`}></div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats - Pages Detail & User Roles */}
      {(pageStatCards.length > 0 || userRoleCards.length > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-600" />
            Detailed Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...pageStatCards, ...userRoleCards].map((stat, index) => {
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
      )}

      {/* Recent Activity Section - Dynamic layout */}
      <div className={`grid gap-6 ${isSuperAdmin ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Recent Pages - Full width for site_admin, half width for super_admin */}
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${!isSuperAdmin ? 'col-span-1' : ''}`}>
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

        {/* Recent Users - Only for super_admin */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  Recent Users
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {recentUsers.length} items
                </span>
              </div>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add users to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          user.role === 'super_admin' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <Sparkles size={16} className={
                            user.role === 'super_admin' ? 'text-purple-600' : 'text-blue-600'
                          } />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
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

      {/* Quick Actions - Optional */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {isSuperAdmin && (
            <a href="/admin/users" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">Roles & permissions</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;