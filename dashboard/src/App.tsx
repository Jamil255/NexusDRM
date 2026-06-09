import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
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
            <Route index element={<DashboardPage />} />
            
            {/* User Catalog */}
            <Route path="users" element={<UsersPage />} />

            {/* Content Vault */}
            <Route path="content" element={<ContentPage />} />

            {/* License Authority */}
            <Route path="licenses" element={<LicensesPage />} />

            {/* Security Audit logs */}
            <Route path="audit" element={<AuditPage />} />

            {/* SaaS MRR Revenue analytics */}
            <Route path="revenue" element={<RevenuePage />} />

            {/* Container resource health metrics */}
            <Route path="system" element={<SystemPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
