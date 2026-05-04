import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../components/isLoggedIn';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
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
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
