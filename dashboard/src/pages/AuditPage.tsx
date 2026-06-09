import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Search, Download, RefreshCw, AlertTriangle, FileJson, Info } from 'lucide-react';

interface AuditLogRecord {
  id: string;
  action: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/audit-logs', {
        params: {
          page,
          limit,
          action: actionFilter || undefined,
        },
      });
      const result = res.data?.data || res.data;
      if (Array.isArray(result)) {
        setLogs(result);
        setTotal(result.length);
      } else if (result?.items) {
        setLogs(result.items);
        setTotal(result.total || result.items.length);
      } else {
        setLogs(result || []);
        setTotal(result?.length || 0);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      showToast('Backend connection error. Displaying simulated security logs.', 'error');
      const fallback = getFallbackLogs();
      setLogs(fallback);
      setTotal(fallback.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const openLogDetails = (log: AuditLogRecord) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  // Local Search filtering on email, action or IP
  const filteredLogs = logs.filter((l) => {
    const term = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(term) ||
      (l.user?.email || '').toLowerCase().includes(term) ||
      l.ipAddress.toLowerCase().includes(term)
    );
  });

  // Export logs helper
  const exportLogs = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `NexusDRM_Audit_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('JSON logs exported successfully.');
    } else {
      const headers = ['ID', 'Action', 'Operator', 'IP Address', 'Result', 'Created At'];
      const rows = filteredLogs.map((l) => [
        l.id,
        l.action,
        l.user?.email || 'SYSTEM',
        l.ipAddress,
        l.status,
        l.createdAt,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NexusDRM_Audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV logs exported successfully.');
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      render: (row: AuditLogRecord) => (
        <span className="text-xs text-dark-400 font-semibold">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action / Operation',
      render: (row: AuditLogRecord) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-900 border border-dark-800 text-dark-200">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Operator',
      render: (row: AuditLogRecord) => (
        <div>
          <p className="font-bold text-dark-100">{row.user?.firstName ? `${row.user.firstName} ${row.user.lastName}` : 'SYSTEM'}</p>
          <p className="text-[10px] text-dark-500">{row.user?.email || 'Internal Service Cron'}</p>
        </div>
      ),
    },
    {
      header: 'IP / Network',
      render: (row: AuditLogRecord) => (
        <span className="font-mono text-xs text-dark-450">{row.ipAddress}</span>
      ),
    },
    {
      header: 'Status',
      render: (row: AuditLogRecord) => (
        <Badge status={row.status} variant={row.status === 'SUCCESS' ? 'success' : 'danger'} />
      ),
    },
    {
      header: 'Payload',
      render: (row: AuditLogRecord) => (
        <button
          onClick={() => openLogDetails(row)}
          className="p-1.5 rounded bg-dark-850 hover:bg-dark-800 border border-dark-800 text-dark-350 hover:text-dark-100 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <Info size={14} />
          <span className="text-[10px] font-bold">Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 border animate-pulse-subtle ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}
        >
          {toast.type === 'error' && <AlertTriangle size={18} />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">Security Audit Logs</h1>
          <p className="text-dark-400 text-sm font-medium">Verify system action events, tracking admin operations and license compliance logs.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-dark-100 transition-all cursor-pointer"
            title="Reload Logs"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={() => exportLogs('csv')}
            className="px-3 py-2.5 rounded-lg text-xs font-bold bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-200 hover:text-dark-50 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Download size={14} className="text-brand-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportLogs('json')}
            className="px-3 py-2.5 rounded-lg text-xs font-bold bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-200 hover:text-dark-50 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <FileJson size={14} className="text-teal-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Search / filter box */}
      <div className="glass-card p-4 rounded-xl border border-dark-800/60 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, IP or email..."
            className="w-full pl-9 pr-4 py-2 glass-input text-xs text-dark-100 placeholder:text-dark-650 font-medium"
          />
        </form>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 glass-input text-xs text-dark-300 font-semibold cursor-pointer"
        >
          <option value="">All Operations</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_LOGOUT">USER_LOGOUT</option>
          <option value="CONTENT_UPLOADED">CONTENT_UPLOADED</option>
          <option value="CONTENT_PUBLISHED">CONTENT_PUBLISHED</option>
          <option value="LICENSE_GENERATED">LICENSE_GENERATED</option>
          <option value="LICENSE_REVOKED">LICENSE_REVOKED</option>
          <option value="LICENSE_ACTIVATED">LICENSE_ACTIVATED</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        emptyMessage="No security events found in audit indexes."
      />

      {/* Inspect Log details */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Audit Event Inspector">
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Event ID</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 font-mono text-[10px] text-dark-300 break-all select-all mt-1">
                  {selectedLog.id}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Operation / Action</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 font-bold text-dark-200 mt-1">
                  {selectedLog.action}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">IP Address</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 font-mono text-dark-300 mt-1">
                  {selectedLog.ipAddress}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Status</span>
                <div className="mt-1 block">
                  <Badge status={selectedLog.status} variant={selectedLog.status === 'SUCCESS' ? 'success' : 'danger'} />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Operator Mail</span>
                <div className="p-2 bg-dark-900 rounded border border-dark-800 text-dark-350 truncate mt-1" title={selectedLog.user?.email || 'SYSTEM'}>
                  {selectedLog.user?.email || 'SYSTEM'}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block">Browser / UserAgent</span>
              <div className="p-2 bg-dark-900 rounded border border-dark-800 text-dark-400 mt-1 break-words">
                {selectedLog.userAgent || 'Unknown Header'}
              </div>
            </div>

            {selectedLog.details && (
              <div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider block mb-1">Payload / Details JSON</span>
                <pre className="p-3 bg-dark-950 rounded-lg border border-dark-850 font-mono text-[10px] text-emerald-450 overflow-x-auto select-all max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-dark-850">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-dark-300 border border-dark-800 rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Fallback audit log data
const getFallbackLogs = (): AuditLogRecord[] => [
  {
    id: 'a984fd3d-c1b2-45e3-be45-a98436cb4a52',
    action: 'USER_LOGIN',
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    status: 'SUCCESS',
    details: { email: 'jamil@example.com', sessionExpires: '7d' },
    createdAt: '2026-06-09T03:30:00Z',
    user: { firstName: 'Jamil', lastName: 'Ahmed', email: 'jamil@example.com' },
  },
  {
    id: 'b1239c84-90ab-cd45-ef67-891012345678',
    action: 'LICENSE_GENERATED',
    ipAddress: '127.0.0.1',
    userAgent: 'NestJS Auth Cron Service',
    status: 'SUCCESS',
    details: { contentId: 'c1d2e3f4-a1b2-3c4d', userId: 'f8d3c19b-c2e3-4f9e', licenseType: 'SUBSCRIPTION' },
    createdAt: '2026-06-09T02:15:00Z',
  },
  {
    id: 'c5678d90-ef12-3456-789a-bcdef0123456',
    action: 'CONTENT_UPLOADED',
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    status: 'SUCCESS',
    details: { title: 'Executive Keynote Speech Q4', sizeBytes: 45601249, type: 'video/mp4' },
    createdAt: '2026-06-08T18:30:00Z',
    user: { firstName: 'Jamil', lastName: 'Ahmed', email: 'jamil@example.com' },
  },
  {
    id: 'd0123e45-f678-90ab-cdef-0123456789ab',
    action: 'LICENSE_REVOKED',
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    details: { licenseId: 'l9a8b7c6-d5e4-3f2a-1b0c', revokedBy: 'admin@example.com' },
    createdAt: '2026-06-06T15:00:00Z',
  },
];
