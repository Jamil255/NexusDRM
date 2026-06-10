import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, Mail, CheckCircle2, Lock, Globe } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

type Status = 'loading' | 'success' | 'error' | 'no-token';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verify = async () => {
      try {
        await axios.post(`${API_BASE}/auth/verify-email`, { token });
        setStatus('success');
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Verification failed. The token may be invalid or expired.';
        setErrorMessage(msg);
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
              <ShieldCheck size={22} className="text-brand-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-dark-50">
              Nexus<span className="text-brand-400">DRM</span>
            </span>
          </div>
          <p className="text-dark-500 text-xs font-medium tracking-wider uppercase">Email Verification</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-dark-700/60 shadow-2xl shadow-black/40 overflow-hidden">
          {/* Status-dependent header gradient */}
          <div className={`h-1 w-full ${
            status === 'loading' ? 'bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 animate-gradient-x' :
            status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
            'bg-gradient-to-r from-rose-500 to-amber-500'
          }`} />

          <div className="p-8">
            {/* ─── Loading ─── */}
            {status === 'loading' && (
              <div className="text-center py-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <Loader2 size={32} className="text-brand-400 animate-spin" />
                  </div>
                  <div className="absolute -inset-3 rounded-3xl border border-brand-500/10 animate-ping opacity-30" />
                </div>
                <h2 className="text-xl font-bold text-dark-50 mb-2">Verifying Your Email</h2>
                <p className="text-dark-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                  Please wait while we verify your email address. This will only take a moment.
                </p>
                <div className="flex items-center justify-center space-x-1.5 mt-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Success ─── */}
            {status === 'success' && (
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-fade-in-up">
                    <CheckCircle2 size={36} className="text-emerald-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-dark-50 mb-2">Email Verified! 🎉</h2>
                <p className="text-dark-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8">
                  Your email has been successfully verified. Your account is now active and ready to use. You can sign in to access the NexusDRM dashboard.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-dark-950 transition-all border border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </button>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { icon: <Lock size={14} />, label: 'Secure Access' },
                    { icon: <Globe size={14} />, label: 'DRM Protection' },
                    { icon: <Mail size={14} />, label: 'Notifications' },
                  ].map((f) => (
                    <div key={f.label} className="p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                      <div className="text-brand-400 mb-1.5 flex justify-center">{f.icon}</div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-dark-500">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Error ─── */}
            {status === 'error' && (
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-fade-in-up">
                    <AlertCircle size={36} className="text-rose-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-dark-50 mb-2">Verification Failed</h2>
                <p className="text-dark-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-3">
                  {errorMessage}
                </p>

                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 mb-6">
                  <p className="text-rose-400/70 text-xs leading-relaxed">
                    If you continue to experience issues, please contact your organization administrator or request a new verification email.
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-dark-850 hover:bg-dark-800 text-dark-200 transition-all border border-dark-700 cursor-pointer"
                  >
                    <span>Go to Login</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── No Token ─── */}
            {status === 'no-token' && (
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Mail size={36} className="text-amber-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-dark-50 mb-2">Missing Verification Token</h2>
                <p className="text-dark-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-6">
                  No verification token was found. Please use the link from the email you received. If you didn't get an email, contact your administrator.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-dark-850 hover:bg-dark-800 text-dark-200 transition-all border border-dark-700 cursor-pointer"
                >
                  <span>Go to Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Disclaimer Footer */}
          <div className="px-8 py-4 border-t border-dark-800/60 bg-dark-900/30">
            <p className="text-[10px] text-dark-600 text-center leading-relaxed">
              This is an automated verification from <span className="text-dark-400 font-semibold">NexusDRM</span>. 
              If you did not create an account, please ignore this page. 
              Your information is protected under our Privacy Policy and Terms of Service. 
              © {new Date().getFullYear()} NexusDRM. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 2s ease infinite;
        }
      `}</style>
    </div>
  );
};
