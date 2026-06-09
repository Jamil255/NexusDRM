import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Desktop Sidebar (visible on large screen) */}
      <div className="hidden lg:block shrink-0 w-64">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (drawer overlay) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          {/* Drawer body */}
          <div className="relative w-64 h-full animate-slide-in">
            <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
