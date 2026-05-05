import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../components/isLoggedIn';
import { updateFavicon } from '../../utils/favicon';
import { sitesApi } from '../../api/sites';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Check if we're in the builder - more robust detection
  const isBuilder = useMemo(() => {
    const path = location.pathname;
    // Match patterns like: /admin/pages/new, /admin/site/pages/new, /admin/pages/123/edit, etc.
    return path.includes('/pages/new') || 
           (path.includes('/pages/') && path.includes('/edit'));
  }, [location.pathname]);
  
  // Load default site favicon on mount for admin pages
  useEffect(() => {
    const loadDefaultSiteFavicon = async () => {
      try {
        const response = await sitesApi.getDefault();
        // Unwrap JsonResource: response.data.data
        const siteData = response.data?.data || response.data || response;
        if (siteData?.favicon_url) {
          updateFavicon(siteData.favicon_url);
        }
      } catch (error) {
        console.error('Failed to load default site favicon:', error);
      }
    };

    loadDefaultSiteFavicon();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Hide sidebar in builder mode */}
      {!isBuilder && <AdminSidebar />}
      <div className={`flex-1 flex flex-col overflow-hidden ${isBuilder ? 'full-width' : ''}`}>
        {/* Hide header in builder mode for more space */}
        {!isBuilder && (
          <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
            <h1 className="text-white text-lg font-bold">Fursan CMS</h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 text-sm">{user?.name}</span>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </header>
        )}
        <main className={`flex-1 overflow-y-auto ${isBuilder ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
