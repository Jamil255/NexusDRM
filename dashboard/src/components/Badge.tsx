import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant }) => {
  const getColors = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        case 'warning':
          return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        case 'danger':
          return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        case 'info':
          return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
        default:
          return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      }
    }

    const norm = status?.toLowerCase() || '';
    if (['active', 'published', 'success', 'completed', 'verified', 'activated'].includes(norm)) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (['pending', 'processing', 'warning', 'idle'].includes(norm)) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (['suspended', 'revoked', 'failed', 'inactive', 'archived', 'error'].includes(norm)) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (['info', 'running', 'processing'].includes(norm)) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getColors()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 animate-pulse-subtle"></span>
      {status}
    </span>
  );
};
