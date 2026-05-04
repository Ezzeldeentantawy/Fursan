import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  UserPlus, 
  Settings,
  Image
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/pages', label: 'Pages', icon: FileText },
  { path: '/admin/sites', label: 'Sites', icon: Globe },
  { path: '/admin/dashboard/create-employer-account', label: 'Create Employer', icon: UserPlus },
  { path: '/admin/media', label: 'Media', icon: Image },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white font-bold text-xl">Fursan CMS</h2>
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
    </aside>
  );
};

export default AdminSidebar;
