import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { KpiCard } from '../components/KpiCard';
import { DollarSign, BarChart3, TrendingUp, Percent, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';

interface PlanDistribution {
  planName: string;
  count: number;
  revenue: number;
}

interface RevenueReport {
  mrr: number;
  arr: number;
  growthRate: number;
  churnRate: number;
  planDistribution: PlanDistribution[];
  monthlyRevenueHistory: { month: string; amount: number }[];
}

export const RevenuePage: React.FC = () => {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/analytics/revenue');
      setReport(res.data?.data || res.data);
    } catch (err: any) {
      console.error('Failed to load revenue analytics:', err);
      setError('Connection to NestJS backend failed. Displaying simulated SaaS billing data.');
      setReport(getFallbackRevenue());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-dark-400">
        <Loader2 size={36} className="animate-spin text-brand-500 mb-4" />
        <span className="text-sm font-semibold tracking-wider uppercase">Loading Billing Ledgers...</span>
      </div>
    );
  }

  // Chart 1: Revenue trend
  const trendData = {
    labels: report?.monthlyRevenueHistory?.map((h) => h.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue',
        data: report?.monthlyRevenueHistory?.map((h) => h.amount) || [8000, 9500, 11000, 12000, 12450],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart 2: Plan distribution
  const distributionData = {
    labels: report?.planDistribution?.map((p) => p.planName) || ['Basic Plan', 'Premium Plan', 'Enterprise Plan'],
    datasets: [
      {
        data: report?.planDistribution?.map((p) => p.count) || [25, 12, 4],
        backgroundColor: [
          'rgba(52, 211, 153, 0.6)', // emerald-400
          'rgba(20, 184, 166, 0.6)', // teal-500
          'rgba(14, 165, 233, 0.6)', // sky-500
        ],
        borderColor: [
          '#34d399',
          '#14b8a6',
          '#0ea5e9',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#1e293b',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 41, 59, 0.2)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.2)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Outfit', size: 11 },
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">Revenue Analytics</h1>
          <p className="text-dark-400 text-sm font-medium">Audit MRR growth curves, billing plan densities, and customer retention metrics.</p>
        </div>
        <div>
          <button
            onClick={fetchRevenue}
            className="p-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-dark-100 transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center space-x-3 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Monthly Recurring"
          value={`$${(report?.mrr || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign size={20} />}
          description="Total active subscriptions price"
        />
        <KpiCard
          title="Annual Recurring"
          value={`$${(report?.arr || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} />}
          description="MRR annualized projection"
        />
        <KpiCard
          title="SaaS Growth Rate"
          value={`${report?.growthRate || 0}%`}
          icon={<BarChart3 size={20} />}
          description="Monthly revenue expand rate"
        />
        <KpiCard
          title="Logo Churn Rate"
          value={`${report?.churnRate || 0}%`}
          icon={<Percent size={20} />}
          description="Subscription cancel rate"
        />
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line */}
        <div className="glass-card p-6 rounded-xl border border-dark-800/60 lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-dark-100">Revenue Growth Curves</h3>
            <p className="text-xs text-dark-400 font-medium">Monthly billing volumes track</p>
          </div>
          <div className="h-72 relative">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        {/* Plan Doughnut distribution */}
        <div className="glass-card p-6 rounded-xl border border-dark-800/60 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-dark-100">Pricing Plan Density</h3>
            <p className="text-xs text-dark-400 font-medium">Distribution of tenant subscriptions by pricing tier</p>
          </div>
          <div className="h-64 relative">
            <Doughnut data={distributionData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Plans List Table */}
      <div className="glass-card rounded-xl border border-dark-800/60 overflow-hidden">
        <div className="px-6 py-4 bg-dark-900/60 border-b border-dark-800/60">
          <h3 className="text-sm font-bold text-dark-150">Active Tier Billing Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-dark-200">
            <thead className="bg-dark-900/40 text-xs text-dark-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Billing Tier</th>
                <th className="px-6 py-3">Organization Node Count</th>
                <th className="px-6 py-3">Accumulated MRR Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/40">
              {report?.planDistribution?.map((p, idx) => (
                <tr key={idx} className="hover:bg-dark-900/20 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-dark-50">{p.planName}</td>
                  <td className="px-6 py-3.5 font-semibold text-dark-300">{p.count} Active Org(s)</td>
                  <td className="px-6 py-3.5 font-bold text-brand-400">${p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-dark-500">
                    No active subscriptions detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Fallback pricing report
const getFallbackRevenue = (): RevenueReport => ({
  mrr: 12450.0,
  arr: 149400.0,
  growthRate: 8.7,
  churnRate: 1.2,
  planDistribution: [
    { planName: 'Basic Tier Sandbox', count: 25, revenue: 2500.0 },
    { planName: 'Professional Team', count: 12, revenue: 5940.0 },
    { planName: 'Enterprise Secure', count: 4, revenue: 4010.0 },
  ],
  monthlyRevenueHistory: [
    { month: 'Jan', amount: 8715 },
    { month: 'Feb', amount: 9960 },
    { month: 'Mar', amount: 10580 },
    { month: 'Apr', amount: 11205 },
    { month: 'May', amount: 12450 },
  ],
});
