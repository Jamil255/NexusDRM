import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertTriangle, Ban, ShieldX, UserX, KeyRound, WifiOff, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../api/errors';

/* ─── Error code → user-friendly info map ─── */
const ERROR_MAP: Record<string, { icon: React.ReactNode; title: string; message: string; color: string }> = {
  AUTH_ACCOUNT_DEACTIVATED: {
    icon: <Ban size={20} />,
    title: 'Account Deactivated',
    message: 'Your account has been deactivated by an administrator. Contact your organization admin to restore access.',
    color: 'rose',
  },
  AUTH_ACCOUNT_SUSPENDED: {
    icon: <ShieldX size={20} />,
    title: 'Account Suspended',
    message: 'Your account is temporarily suspended. Please contact support for more information.',
    color: 'amber',
  },
  AUTH_INVALID_CREDENTIALS: {
    icon: <KeyRound size={20} />,
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please try again.',
    color: 'rose',
  },
  AUTH_USER_NOT_FOUND: {
    icon: <UserX size={20} />,
    title: 'Account Not Found',
    message: 'No account exists with this email address. Check your email or contact your admin.',
    color: 'rose',
  },
  AUTH_TOO_MANY_ATTEMPTS: {
    icon: <ShieldX size={20} />,
    title: 'Too Many Attempts',
    message: 'Your account has been temporarily locked due to too many failed login attempts. Please try again later.',
    color: 'amber',
  },
  NETWORK_ERROR: {
    icon: <WifiOff size={20} />,
    title: 'Connection Failed',
    message: 'Unable to reach the server. Please check your internet connection and try again.',
    color: 'amber',
  },
};

interface ParsedError {
  code: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

function parseLoginError(err: any): ParsedError {
  // Check for network errors first
  if (!err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
    const info = ERROR_MAP['NETWORK_ERROR'];
    return { code: 'NETWORK_ERROR', ...info };
  }

  // Try to extract the structured error code from the response
  const errorCode = err.response?.data?.error?.code;
  const errorMessage = err.response?.data?.error?.message || err.response?.data?.message;

  if (errorCode && ERROR_MAP[errorCode]) {
    return { code: errorCode, ...ERROR_MAP[errorCode] };
  }

  // Generic fallback — use global parser for message extraction
  const parsed = parseApiError(err);
  return {
    code: parsed.code,
    icon: <AlertTriangle size={20} />,
    title: 'Authentication Failed',
    message: parsed.message,
    color: 'rose',
  };
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ParsedError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);

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
      const parsed = parseLoginError(err);
      setError(parsed);
      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string; iconText: string; titleText: string }> = {
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/25',
      text: 'text-rose-400/80',
      iconText: 'text-rose-400',
      titleText: 'text-rose-300',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      text: 'text-amber-400/80',
      iconText: 'text-amber-400',
      titleText: 'text-amber-300',
    },
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

        {/* Error Display */}
        {error && (
          <div
            className={`mt-6 p-4 rounded-xl ${colorClasses[error.color]?.bg || colorClasses.rose.bg} ${colorClasses[error.color]?.border || colorClasses.rose.border} border flex items-start space-x-3 animate-fade-in-up ${shakeError ? 'animate-shake' : ''}`}
          >
            <div className={`shrink-0 mt-0.5 ${colorClasses[error.color]?.iconText || colorClasses.rose.iconText}`}>
              {error.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${colorClasses[error.color]?.titleText || colorClasses.rose.titleText}`}>
                {error.title}
              </p>
              <p className={`text-xs mt-1 leading-relaxed ${colorClasses[error.color]?.text || colorClasses.rose.text}`}>
                {error.message}
              </p>
              {error.code !== 'UNKNOWN' && error.code !== 'NETWORK_ERROR' && (
                <p className="text-[10px] mt-2 text-dark-600 font-mono">
                  Code: {error.code}
                </p>
              )}
            </div>
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
