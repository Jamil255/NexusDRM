import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { GaugeChart } from '../components/GaugeChart';
import { Cpu, Database, Server, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface QueueDepth {
  queueName: string;
  size: number;
}

interface SystemHealth {
  uptimeSeconds: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  dbConnectionPool: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
  };
  queueDepths: QueueDepth[];
}

export const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/system/health');
      setHealth(res.data?.data || res.data);
    } catch (err: any) {
      console.error('Failed to query system health:', err);
      setError('Connection to NestJS backend failed. Running system telemetry simulator.');
      setHealth(getFallbackHealth());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-poll system status every 5 seconds
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get('/admin/system/health');
        setHealth(res.data?.data || res.data);
      } catch (err) {
        // Suppress console alerts during background poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Format Uptime
  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const formatMb = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading && !health) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-dark-400">
        <Loader2 size={36} className="animate-spin text-brand-500 mb-4" />
        <span className="text-sm font-semibold tracking-wider uppercase">Connecting to Telemetry Node...</span>
      </div>
    );
  }

  // Calculate percentages
  const memTotal = health?.memoryUsage.heapTotal || 1;
  const memUsed = health?.memoryUsage.heapUsed || 0;
  const memoryPercentage = Math.round((memUsed / memTotal) * 100);

  // CPU
  // cpuUsage is user/system clock ticks. Convert to standard % ratio representation for mock/demonstration purposes
  const cpuUser = health?.cpuUsage.user || 0;
  const cpuSystem = health?.cpuUsage.system || 0;
  const cpuPercentVal = Math.round(((cpuUser + cpuSystem) / 100000) % 100) || 12;

  // DB Connections
  const dbTotal = health?.dbConnectionPool.totalConnections || 10;
  const dbActive = health?.dbConnectionPool.activeConnections || 1;
  const dbPercentage = Math.round((dbActive / dbTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">System Monitoring</h1>
          <p className="text-dark-400 text-sm font-medium">Verify container cpu resources, database connection counts, and background job queue pools.</p>
        </div>
        <div>
          <button
            onClick={fetchHealth}
            className="p-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-dark-100 transition-all cursor-pointer"
            title="Refresh Node stats"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 animate-bounce" />
          <span>{error}</span>
        </div>
      )}

      {/* Gauges row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GaugeChart
          title="CPU Utilization"
          value={cpuPercentVal}
          icon={<Cpu size={18} />}
          subtitle="User/System Ratio"
        />
        <GaugeChart
          title="NodeJS Heap Memory"
          value={memoryPercentage}
          icon={<Server size={18} />}
          subtitle={`${formatMb(memUsed)} / ${formatMb(memTotal)}`}
        />
        <GaugeChart
          title="DB Connection Pool"
          value={dbPercentage}
          icon={<Database size={18} />}
          subtitle={`${dbActive} / ${dbTotal} Active`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PgBoss Queue Depths */}
        <div className="glass-card p-6 rounded-xl border border-dark-800/60 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-dark-100 font-sans">PgBoss Background Queues</h3>
            <p className="text-xs text-dark-400 font-medium">Telemetry counts of tasks waiting in DB message queues</p>
          </div>
          
          <div className="space-y-4">
            {health?.queueDepths.map((q) => (
              <div key={q.queueName} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-dark-300 font-mono">{q.queueName}</span>
                  <span className={q.size > 0 ? 'text-amber-400 font-bold' : 'text-dark-400'}>
                    {q.size} pending job(s)
                  </span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-dark-800/60">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      q.size > 10 ? 'bg-rose-500' : q.size > 0 ? 'bg-amber-500 animate-pulse' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min((q.size + 1) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Process Metrics */}
        <div className="glass-card p-6 rounded-xl border border-dark-800/60 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-dark-100 font-sans">Daemon Telemetry Details</h3>
            <p className="text-xs text-dark-400 font-medium">Uptime counters and memory maps</p>
          </div>

          <div className="divide-y divide-dark-800/40 text-xs font-semibold">
            <div className="py-3 flex justify-between">
              <span className="text-dark-400">Process Uptime:</span>
              <span className="text-brand-400 font-bold font-mono text-glow-brand">
                {formatUptime(health?.uptimeSeconds || 0)}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-dark-400">RSS Size (Physical):</span>
              <span className="text-dark-200 font-mono">{formatMb(health?.memoryUsage.rss || 0)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-dark-400">External Allocated Buffer:</span>
              <span className="text-dark-200 font-mono">{formatMb(health?.memoryUsage.external || 0)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-dark-400">Database Engine Host:</span>
              <span className="text-emerald-400 font-bold">PostgreSQL Localhost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fallback health status
const getFallbackHealth = (): SystemHealth => ({
  uptimeSeconds: 785642,
  memoryUsage: {
    rss: 124501920,
    heapTotal: 84901240,
    heapUsed: 42409124,
    external: 15492040,
  },
  cpuUsage: {
    user: 4590124,
    system: 1259204,
  },
  dbConnectionPool: {
    totalConnections: 15,
    activeConnections: 3,
    idleConnections: 12,
  },
  queueDepths: [
    { queueName: 'cloudinary-upload-processor', size: 0 },
    { queueName: 'video-hls-transcoder', size: 0 },
    { queueName: 'content-crypto-processor', size: 0 },
    { queueName: 'email-dispatch-queue', size: 0 },
  ],
});
