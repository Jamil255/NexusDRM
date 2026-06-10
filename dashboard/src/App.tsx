import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ContentPage } from './pages/ContentPage';
import { LicensesPage } from './pages/LicensesPage';
import { AuditPage } from './pages/AuditPage';
import { RevenuePage } from './pages/RevenuePage';
import { SystemPage } from './pages/SystemPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public SaaS landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Email Verification */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Console Control Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Overview / Analytics stats */}
            <Route index element={<ProtectedRoute requiredPerms={['admin:access']}><DashboardPage /></ProtectedRoute>} />
            
            {/* User Catalog */}
            <Route path="users" element={<ProtectedRoute requiredPerms={['user:read', 'user:manage']}><UsersPage /></ProtectedRoute>} />

            {/* Content Vault */}
            <Route path="content" element={<ProtectedRoute requiredPerms={['content:read', 'content:write']}><ContentPage /></ProtectedRoute>} />

            {/* License Authority */}
            <Route path="licenses" element={<ProtectedRoute requiredPerms={['license:read', 'license:manage']}><LicensesPage /></ProtectedRoute>} />

            {/* Security Audit logs */}
            <Route path="audit" element={<ProtectedRoute requiredPerms={['audit:read']}><AuditPage /></ProtectedRoute>} />

            {/* SaaS MRR Revenue analytics */}
            <Route path="revenue" element={<ProtectedRoute requiredPerms={['admin:access']}><RevenuePage /></ProtectedRoute>} />

            {/* Container resource health metrics */}
            <Route path="system" element={<ProtectedRoute requiredPerms={['admin:access']}><SystemPage /></ProtectedRoute>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
