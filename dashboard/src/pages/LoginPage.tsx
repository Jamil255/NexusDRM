import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to login. Please verify your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center border-glow-brand shadow-lg shadow-brand-500/10">
          <Shield size={20} className="text-dark-950 font-bold" />
        </div>
        <span className="text-2xl font-bold font-sans tracking-wide text-dark-50">
          Nexus<span className="text-brand-400">DRM</span>
        </span>
      </Link>

      {/* Login Box */}
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-dark-800/80 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/0 to-brand-500/5 opacity-40 rounded-2xl pointer-events-none"></div>

        <h2 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">Console Login</h2>
        <p className="text-dark-400 text-sm mt-1.5 font-medium">Access your secure DRM management controls.</p>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3 text-rose-400 text-sm font-semibold">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexusdrm.com"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-sm font-bold bg-brand-500 hover:bg-brand-400 text-dark-950 hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50 disabled:hover:shadow-none transition-all flex items-center justify-center space-x-2 border border-brand-400 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Console</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-dark-850 text-center">
          <p className="text-xs text-dark-500 font-medium">
            Demo credentials: <span className="text-dark-350 font-semibold select-all">admin@drms.com</span> / <span className="text-dark-350 font-semibold select-all">Admin@123456</span>
          </p>
        </div>
      </div>
    </div>
  );
};
