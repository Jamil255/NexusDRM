import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Film,
  Key,
  History,
  TrendingUp,
  Activity,
  LogOut,
  ShieldAlert,
  Globe
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { logout, user, hasPermission } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} />, requiredPerms: ['admin:access'] },
    { to: '/dashboard/users', label: 'User Control', icon: <Users size={18} />, requiredPerms: ['user:read', 'user:manage'] },
    { to: '/dashboard/content', label: 'Content Vault', icon: <Film size={18} />, requiredPerms: ['content:read', 'content:write'] },
    { to: '/dashboard/licenses', label: 'Licenses', icon: <Key size={18} />, requiredPerms: ['license:read', 'license:manage'] },
    { to: '/dashboard/audit', label: 'Audit Trail', icon: <History size={18} />, requiredPerms: ['audit:read'] },
    { to: '/dashboard/revenue', label: 'Revenue/SaaS', icon: <TrendingUp size={18} />, requiredPerms: ['admin:access'] },
    { to: '/dashboard/system', label: 'System Health', icon: <Activity size={18} />, requiredPerms: ['admin:access'] },
  ].filter((item) => hasPermission(item.requiredPerms));

  return (
    <div className="w-64 h-screen bg-dark-950/90 border-r border-dark-800/80 flex flex-col fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-dark-800/60 justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center border-glow-brand">
            <ShieldAlert size={18} className="text-dark-950 font-bold" />
          </div>
          <span className="text-lg font-bold font-sans tracking-wide text-dark-50">
            Nexus<span className="text-brand-400">DRM</span>
          </span>
        </div>
        <Badge status="SaaS" variant="success" />
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-dark-500 tracking-wider px-2 mb-2">
          Administration
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-brand-500/10 text-brand-350 border border-brand-500/20 text-glow-brand'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-900/50 border border-transparent'
              }`
            }
          >
            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="border-t border-dark-800/40 my-4 pt-4"></div>

        <div className="text-[10px] uppercase font-bold text-dark-500 tracking-wider px-2 mb-2">
          Public Website
        </div>
        <NavLink
          to="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-dark-400 hover:text-dark-100 hover:bg-dark-900/50 transition-all border border-transparent"
          onClick={onCloseMobile}
        >
          <Globe size={18} />
          <span>Product Home</span>
        </NavLink>
      </nav>

      {/* User Session Footer */}
      {user && (
        <div className="p-4 border-t border-dark-800/60 bg-dark-900/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold uppercase shrink-0">
              {user.firstName ? user.firstName[0] : user.email[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-dark-50 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-dark-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-dark-400 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Internal Badge helper
const Badge: React.FC<{ status: string; variant?: string }> = ({ status }) => (
  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
    {status}
  </span>
);
