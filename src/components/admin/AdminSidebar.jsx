import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  Users,
  Settings,
  Image,
  User
} from 'lucide-react';
import { useAuth } from '../../components/isLoggedIn';

const allNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'site_admin'] },
  { path: '/admin/pages', label: 'Pages', icon: FileText, roles: ['super_admin', 'site_admin'] },
  { path: '/admin/sites', label: 'Sites', icon: Globe, roles: ['super_admin'] },
  { path: '/admin/users', label: 'Users', icon: Users, roles: ['super_admin'] },
  { path: '/admin/media', label: 'Media', icon: Image, roles: ['super_admin', 'site_admin'] },
  { path: '/admin/profile', label: 'Profile', icon: User, roles: ['super_admin', 'site_admin'] },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || 'site_admin';
  
  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white font-bold text-xl">Fursan CMS</h2>
        {user && (
          <p className="text-slate-400 text-xs mt-1">
            {user.name} ({userRole === 'super_admin' ? 'Super Admin' : 'Site Admin'})
          </p>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">
          Fursan CMS v1.0
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
