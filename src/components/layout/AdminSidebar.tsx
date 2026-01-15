import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare,
  MapPin, 
  Package, 
  Tags, 
  Shield, 
  ShieldCheck,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const navItems = [
  { label: 'Dashboard', to: '/admin/sales', icon: <LayoutDashboard size={20} /> },
  { label: 'User Management', to: '/admin/users', icon: <Users size={20} /> },
  { label: 'Staff Management', to: '/admin/staff', icon: <Briefcase size={20} /> },
  { label: 'Task Management', to: '/admin/tasks', icon: <CheckSquare size={20} /> },
  { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Finance Leads', to: '/admin/finance-leads', icon: <DollarSign size={20} /> },
  { label: 'Investments', to: '/admin/investments', icon: <TrendingUp size={20} /> },
  { label: 'Marketing', to: '/admin/marketing', icon: <Palette size={20} /> },
  { label: 'Employees', to: '/admin/employees', icon: <Users size={20} /> },
  { label: 'Locations', to: '/admin/locations', icon: <MapPin size={20} /> },
  { label: 'Products', to: '/admin/products', icon: <Package size={20} /> },
  { label: 'Categories', to: '/admin/categories', icon: <Tags size={20} /> },
  { label: 'Roles & Permissions', to: '/admin/roles', icon: <Shield size={20} /> },
  { label: 'Permissions', to: '/admin/permissions', icon: <Shield size={20} /> },
  { label: 'Bulk Verification', to: '/admin/product-verification/bulk', icon: <ShieldCheck size={20} /> },
  { label: 'Content Moderation', to: '/admin/content-moderation', icon: <ShieldCheck size={20} /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings size={20} /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, className }) => {
  const { user } = useSession();
  // Normalized role from user profile
  const role = user?.role || 'guest';

  // Filter items based on role
  const filteredNavItems = navItems.filter(item => {
    // Restrict sensitive settings/permissions to admin/superadmin only
    if (['Settings', 'Roles & Permissions', 'Permissions', 'Employees'].includes(item.label)) {
      return ['admin', 'superadmin'].includes(role);
    }
    // Allow everything else for staff as well
    return true;
  });

  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } ${className || ''}`}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-700">
        {!collapsed && <span className="font-bold text-xl tracking-tight">QuickAdmin</span>}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
         <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white cursor-pointer">
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
         </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
