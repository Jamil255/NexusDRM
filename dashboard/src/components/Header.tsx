import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Create page title/breadcrumbs from url path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Home'];
    return paths.map((path) => path.charAt(0).toUpperCase() + path.slice(1));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-dark-950/60 border-b border-dark-800/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left section: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenMobileSidebar}
          className="text-dark-400 hover:text-dark-100 p-1.5 hover:bg-dark-800/60 rounded-lg lg:hidden transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center space-x-1.5 text-sm font-semibold text-dark-400">
          <span className="hover:text-dark-200 transition-colors">Portal</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className="text-dark-600" />
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? 'text-brand-400 font-bold'
                    : 'hover:text-dark-200 transition-colors'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right section: System status & quick actions */}
      <div className="flex items-center space-x-4">
        {/* Connection status dot */}
        <div className="flex items-center space-x-2 bg-dark-900/60 border border-dark-800 px-3 py-1.5 rounded-full text-xs font-semibold text-dark-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>API Connected</span>
        </div>

        {/* User initials drop trigger */}
        {user && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-dark-300 font-semibold hidden md:inline">
              Welcome, <span className="text-dark-100 font-bold">{user.firstName || user.email}</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
