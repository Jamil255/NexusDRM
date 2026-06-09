import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  loading,
}) => {
  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl border border-dark-800/60 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-dark-800 rounded w-24"></div>
          <div className="w-10 h-10 bg-dark-800 rounded-lg"></div>
        </div>
        <div className="h-8 bg-dark-800 rounded w-20 mt-4"></div>
        <div className="h-3 bg-dark-800 rounded w-32 mt-3"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-dark-800/60 hover:border-brand-500/30 transition-all duration-300 relative group overflow-hidden">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-dark-400 text-sm font-medium tracking-wide uppercase">{title}</span>
          <h3 className="text-3xl font-bold font-sans text-dark-50 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-dark-850 rounded-lg text-brand-400 border border-dark-800 group-hover:text-brand-300 group-hover:border-brand-500/20 transition-all duration-300">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between relative z-10">
        {description && <span className="text-xs text-dark-400 font-medium">{description}</span>}
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
};
