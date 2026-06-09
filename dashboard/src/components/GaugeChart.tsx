import React from 'react';

interface GaugeChartProps {
  value: number; // 0 to 100
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  title,
  subtitle,
  icon,
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Determine indicator color based on percentage
  const getColor = () => {
    if (value >= 90) return 'text-rose-500 stroke-rose-500';
    if (value >= 75) return 'text-amber-500 stroke-amber-500';
    return 'text-brand-500 stroke-brand-500';
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-dark-800/60 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="flex items-center space-x-2 text-dark-400 mb-4 uppercase tracking-wider text-xs font-semibold">
        {icon && <span className="text-brand-400">{icon}</span>}
        <span>{title}</span>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-dark-800 fill-none"
            strokeWidth="8"
          />
          {/* Active progress indicator */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${getColor()}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: value >= 75 ? 'drop-shadow(0 0 6px currentColor)' : 'none',
            }}
          />
        </svg>
        {/* Value Label inside */}
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold font-sans text-dark-50">{value}%</span>
          {subtitle && <span className="text-[10px] text-dark-400 font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
