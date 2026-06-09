import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { parseApiError } from '../api/errors';
import { DataTable } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { CreateUserModal, type CreateUserFormData } from "../components/CreateUserModal";
import { EditUserModal, type EditableUser, type EditUserPayload } from "../components/EditUserModal";
import { UserCheck, UserX, Download, Search, RefreshCw, AlertTriangle, ShieldCheck, Plus, Pencil } from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  organizationId: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateUser = async (formData: CreateUserFormData) => {
    setCreatingUser(true);
    try {
      await apiClient.post('/users', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        roleId: formData.roleId || undefined,
      });

      showToast('User created successfully!', 'success');
      fetchUsers();
    } catch (err: any) {
      const parsed = parseApiError(err);
      throw new Error(parsed.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleEditUser = async (userId: string, payload: EditUserPayload) => {
    setUpdatingUser(true);
    try {
      await apiClient.put(`/users/${userId}`, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        roleId: payload.roleId || undefined,
      });
      showToast('User updated successfully!', 'success');
      fetchUsers();
    } catch (err: any) {
      const parsed = parseApiError(err);
      throw new Error(parsed.message);
    } finally {
      setUpdatingUser(false);
    }
  };

  const openEditModal = (user: UserRecord) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });
    setEditUserModalOpen(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users', {
        params: { page, limit },
      });
      // The backend structure: res.data.data has paginated content. Let's check how it is wrapped.
      // In NestJS controller findAll returns: { success: true, data: { items: [], total: 10 } } or similar
      const result = res.data?.data || res.data;
      if (Array.isArray(result)) {
        setUsers(result);
        setTotal(result.length);
      } else if (result?.items) {
        setUsers(result.items);
        setTotal(result.total || result.items.length);
      } else if (result?.data) {
        setUsers(result.data);
        setTotal(result.data.length);
      } else {
        setUsers(result || []);
        setTotal(result?.length || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      showToast('Backend connection error. Loading demo users list.', 'error');
      const fallback = getFallbackUsers();
      setUsers(fallback);
      setTotal(fallback.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    setActionLoadingId(id);
    try {
      const action = currentStatus === 'ACTIVE' ? 'suspend' : 'activate';
      await apiClient.post(`/admin/users/${id}/${action}`);
      
      showToast(`User successfully ${action === 'suspend' ? 'suspended' : 'activated'}!`);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, status: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' }
            : u
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      showToast(parseApiError(err).message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const deactivateUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will not be able to log in.')) return;
    setActionLoadingId(id);
    try {
      await apiClient.delete(`/users/${id}`);
      showToast('User deactivated successfully!');
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'DEACTIVATED' } : u))
      );
    } catch (err: any) {
      console.error('Failed to deactivate user:', err);
      showToast(parseApiError(err).message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Local Search filtering
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      (u.firstName || '').toLowerCase().includes(term) ||
      (u.lastName || '').toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  // Export to CSV helper
  const exportCsv = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Created At'];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.firstName || '',
      u.lastName || '',
      u.email,
      u.role,
      u.status,
      u.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusDRM_Users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('User database exported to CSV successfully.');
  };

  const columns = [
    {
      header: 'Full Name',
      render: (row: UserRecord) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center font-bold text-brand-400 text-xs uppercase shrink-0">
            {row.firstName ? row.firstName[0] : row.email[0]}
          </div>
          <div>
            <span className="font-bold text-dark-50">
              {row.firstName ? `${row.firstName} ${row.lastName}` : 'System User'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email' as const,
    },
    {
      header: 'Role',
      render: (row: UserRecord) => (
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-dark-350">
          <ShieldCheck size={14} className="text-brand-500" />
          <span>{row.role}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row: UserRecord) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row: UserRecord) => {
        const isActioning = actionLoadingId === row.id;
        return (
          <div className="flex items-center space-x-2">
            {/* Edit */}
            <button
              onClick={() => openEditModal(row)}
              disabled={isActioning}
              title="Edit User"
              className="p-1.5 rounded-lg bg-dark-850 hover:bg-amber-500/15 border border-dark-800 hover:border-amber-500/30 text-dark-400 hover:text-amber-400 transition-all cursor-pointer disabled:opacity-40"
            >
              <Pencil size={14} />
            </button>

            {/* Suspend / Activate */}
            {row.status === 'ACTIVE' ? (
              <button
                onClick={() => toggleUserStatus(row.id, row.status)}
                disabled={isActioning}
                title="Suspend User"
                className="p-1.5 rounded-lg bg-dark-850 hover:bg-rose-500/15 border border-dark-800 hover:border-rose-500/30 text-dark-400 hover:text-rose-400 transition-all cursor-pointer disabled:opacity-40"
              >
                {isActioning ? (
                  <span className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin block"></span>
                ) : (
                  <UserX size={15} />
                )}
              </button>
            ) : (
              <button
                onClick={() => toggleUserStatus(row.id, row.status)}
                disabled={isActioning || row.status === 'DEACTIVATED'}
                title="Activate User"
                className="p-1.5 rounded-lg bg-dark-850 hover:bg-emerald-500/15 border border-dark-800 hover:border-emerald-500/30 text-dark-400 hover:text-emerald-400 transition-all cursor-pointer disabled:opacity-40"
              >
                {isActioning ? (
                  <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin block"></span>
                ) : (
                  <UserCheck size={15} />
                )}
              </button>
            )}

            {/* Deactivate */}
            <button
              onClick={() => deactivateUser(row.id)}
              disabled={isActioning || row.status === 'DEACTIVATED'}
              title="Deactivate Permanent"
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-dark-850 hover:bg-rose-500/10 border border-dark-800 hover:border-rose-500/20 text-rose-500 disabled:opacity-40 cursor-pointer transition-colors"
            >
              Kill Session
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 border animate-pulse-subtle ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}
        >
          {toastMessage.type === 'error' && <AlertTriangle size={18} />}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold font-sans text-dark-50 tracking-tight">User Catalog</h1>
          <p className="text-dark-400 text-sm font-medium">Activate, suspend, or invalidate team access nodes.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCreateUserModalOpen(true)}
            className="px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create User</span>
          </button>
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-lg bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-300 hover:text-dark-100 transition-all cursor-pointer"
            title="Reload Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2.5 rounded-lg text-sm font-bold bg-dark-900 border border-dark-800 hover:border-brand-500/30 text-dark-200 hover:text-dark-50 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Download size={16} className="text-brand-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters/Search box */}
      <div className="glass-card p-4 rounded-xl border border-dark-800/60 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name or role..."
            className="w-full pl-10 pr-4 py-2.0 glass-input text-sm text-dark-100 placeholder:text-dark-500 font-medium"
          />
        </div>
        <div className="text-xs text-dark-400 font-semibold">
          Filtered <span className="text-brand-400 font-bold">{filteredUsers.length}</span> user(s)
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        emptyMessage="No matching users found in organization directory"
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        onSubmit={handleCreateUser}
        loading={creatingUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={() => { setEditUserModalOpen(false); setEditingUser(null); }}
        onSubmit={handleEditUser}
        user={editingUser}
        loading={updatingUser}
      />
    </div>
  );
};

// Fallback Users Generator
const getFallbackUsers = (): UserRecord[] => [
  {
    id: 'f8d3c19b-c2e3-4f9e-bead-5e12814cf601',
    email: 'jamil@example.com',
    firstName: 'Jamil',
    lastName: 'Ahmed',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-06-01T12:00:00Z',
    organizationId: 'org-123',
  },
  {
    id: 'e1d2c3b4-f5e6-7a8b-9c0d-e1f2a3b4c5d6',
    email: 'creator@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'CREATOR',
    status: 'ACTIVE',
    createdAt: '2026-06-03T15:30:00Z',
    organizationId: 'org-123',
  },
  {
    id: '9d8c7b6a-5e4d-3c2b-1a0f-e9d8c7b6a5e4',
    email: 'viewer@example.com',
    firstName: 'Bob',
    lastName: 'Jones',
    role: 'VIEWER',
    status: 'SUSPENDED',
    createdAt: '2026-06-05T09:15:00Z',
    organizationId: 'org-123',
  },
  {
    id: '3c2b1a0f-e9d8-c7b6-a5e4-d3c2b1a0fe9d',
    email: 'manager@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'MANAGER',
    status: 'DEACTIVATED',
    createdAt: '2026-06-06T18:45:00Z',
    organizationId: 'org-123',
  },
];
