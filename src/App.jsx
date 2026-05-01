import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from './components/AdminGuard';
import AdminDashboard from './pages/admin/dashboard';
import CreateEmployerAcc from './pages/admin/createEmployerAcc';
import Builder from './pages/admin/Pages/Builder';
import PagesList from './pages/admin/Pages';
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
          
          {/* Admin routes - THIRD (nested under /admin parent) */}
          <Route path="/admin" element={<AdminGuard />}>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Admin sub-routes (relative paths) */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="dashboard/create-employer-account" element={<CreateEmployerAcc />} />
            <Route path="pages" element={<PagesList />} />
            <Route path="pages/new" element={<Builder />} />
            <Route path="pages/:id/edit" element={<Builder />} />
            
            {/* Catch-all for invalid admin routes */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Dynamic page routes - LAST */}
          <Route path="/:siteDomain" element={<PageRenderer />} />
          <Route path="/:siteDomain/:pageSlug" element={<PageRenderer />} />
        </Routes>
    </Router>
  );
}

export default App;
