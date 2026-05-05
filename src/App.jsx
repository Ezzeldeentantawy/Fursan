import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import SiteAdminGuard from './components/SiteAdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/dashboard';
import SiteAdminDashboard from './pages/admin/SiteAdminDashboard';
import Builder from './pages/admin/Pages/Builder';
import PagesList from './pages/admin/Pages';
import SitesList from './pages/admin/sites';
import CreateSite from './pages/admin/sites/create';
import EditSite from './pages/admin/sites/edit';
import MediaManager from './pages/admin/media';
import UsersList from './pages/admin/users';
import Profile from './pages/admin/Profile';
import Login from './pages/login';
import PageRenderer from './pages/PageRenderer';

function App() {
  return (
    <Router basename="react.fursan">
        <Routes>
          {/* Exact homepage - FIRST */}
          <Route path="/" element={<PageRenderer />} />
          
          {/* Login route - SECOND */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin routes for super_admin - THIRD */}
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              {/* Redirect /admin to /admin/dashboard */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Admin sub-routes (relative paths) */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="pages" element={<PagesList />} />
              <Route path="pages/new" element={<Builder />} />
              <Route path="pages/:id/edit" element={<Builder />} />
              <Route path="sites" element={<SitesList />} />
              <Route path="sites/create" element={<CreateSite />} />
              <Route path="sites/:id/edit" element={<EditSite />} />
              <Route path="users" element={<UsersList />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="profile" element={<Profile />} />
               
               {/* Catch-all for invalid admin routes */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Site Admin routes - for site_admin users */}
          <Route path="/admin/site" element={<SiteAdminGuard />}>
            <Route element={<AdminLayout />}>
              {/* Redirect /admin/site to /admin/site/dashboard */}
              <Route index element={<Navigate to="/admin/site/dashboard" replace />} />
              
              {/* Site Admin sub-routes */}
              <Route path="dashboard" element={<SiteAdminDashboard />} />
              <Route path="pages" element={<PagesList />} />
              <Route path="pages/new" element={<Builder />} />
              <Route path="pages/:id/edit" element={<Builder />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="profile" element={<Profile />} />
               
               {/* Catch-all for invalid site admin routes */}
              <Route path="*" element={<Navigate to="/admin/site/dashboard" replace />} />
            </Route>
          </Route>

          {/* Dynamic page routes - LAST */}
          <Route path="/:siteDomain" element={<PageRenderer />} />
          <Route path="/:siteDomain/:pageSlug" element={<PageRenderer />} />
        </Routes>
    </Router>
  );
}

export default App;
