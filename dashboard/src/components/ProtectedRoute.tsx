import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPerms?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPerms }) => {
  const { isAuthenticated, isLoading, user, hasPermission, getDefaultRoute } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-brand-400 animate-spin animate-pulse-subtle"></div>
        </div>
        <p className="mt-4 text-dark-400 text-sm tracking-wider font-medium">Verifying Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPerms && requiredPerms.length > 0 && !hasPermission(requiredPerms)) {
    // If they can't access this route, send them to their default route
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <>{children}</>;
};
