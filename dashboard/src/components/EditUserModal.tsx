import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Shield,
  Edit3,
  Eye,
  UserPlus,
  Save,
  Sparkles,
  User as UserIcon,
  Mail,
} from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, data: EditUserPayload) => Promise<void>;
  user: EditableUser | null;
  loading?: boolean;
}

export interface EditableUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export interface EditUserPayload {
  firstName: string;
  lastName: string;
  roleId: string;
}

interface Role {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

const ROLES: Role[] = [
  {
    id: 'org_admin',
    name: 'org_admin',
    title: 'Org Admin',
    description: 'Full access & control over everything',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    iconBg: 'bg-purple-500/15',
    icon: <Shield size={18} />,
  },
  {
    id: 'manager',
    name: 'manager',
    title: 'Manager',
    description: 'Content & user management',
    color: 'text-brand-400',
    borderColor: 'border-brand-500/30 hover:border-brand-500/60',
    iconBg: 'bg-brand-500/15',
    icon: <UserPlus size={18} />,
  },
  {
    id: 'editor',
    name: 'editor',
    title: 'Editor',
    description: 'Create & edit content',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/15',
    icon: <Edit3 size={18} />,
  },
  {
    id: 'viewer',
    name: 'viewer',
    title: 'Viewer',
    description: 'Read-only access',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/30 hover:border-slate-500/60',
    iconBg: 'bg-slate-500/15',
    icon: <Eye size={18} />,
  },
];

const AVAILABLE_PERMISSIONS = [
  'Create users',
  'Manage content',
  'View analytics',
  'Manage settings',
  'Create content',
  'Edit own content',
  'Upload files',
  'View content',
  'Download content',
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  org_admin: ['Create users', 'Manage content', 'View analytics', 'Manage settings'],
  manager: ['Create users', 'Manage content', 'View analytics'],
  editor: ['Create content', 'Edit own content', 'Upload files'],
  viewer: ['View content', 'Download content'],
};

// Map role name from backend to our local role ID (which is now the role name)
function resolveRoleId(roleName: string): string {
  const normalized = roleName.toLowerCase();
  const map: Record<string, string> = {
    org_admin: 'org_admin',
    admin: 'org_admin',
    super_admin: 'org_admin',
    manager: 'manager',
    editor: 'editor',
    creator: 'editor',
    viewer: 'viewer',
  };
  return map[normalized] || '';
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  loading = false,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Populate form when user changes
  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      const roleId = resolveRoleId(user.role);
      setSelectedRoleId(roleId);
      setPermissions(ROLE_PERMISSIONS[roleId] || []);
      setSubmitError(null);
      setSubmitSuccess(false);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!user) return;

    try {
      await onSubmit(user.id, {
        firstName,
        lastName,
        roleId: selectedRoleId,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
        setSubmitSuccess(false);
      }, 1500);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to update user');
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !loading) handleClose();
  };

  if (!isOpen || !user) return null;

  const selectedRole = ROLES.find((r) => r.id === selectedRoleId);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`glass-card w-full max-w-lg rounded-2xl border border-dark-700/60 shadow-2xl shadow-black/40 flex flex-col max-h-[92vh] transition-all duration-300 ${
          visible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-dark-800/60 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-t-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Edit3 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-dark-50 tracking-tight">
                  Edit User
                </h2>
                <p className="text-dark-400 text-xs font-medium mt-0.5">
                  Update profile, role & permissions
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-800 hover:border-dark-700 text-dark-400 hover:text-dark-200 transition-all cursor-pointer disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Alert Banners */}
            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3 animate-fade-in-up">
                <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-bold text-sm">User Updated!</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">
                    Changes have been saved successfully.
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3 animate-fade-in-up">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-300 font-bold text-sm">Update Failed</p>
                  <p className="text-rose-400/70 text-xs mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {/* User Identity (read-only) */}
            <div className="rounded-xl bg-dark-850/50 border border-dark-800 p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center font-bold text-brand-400 text-sm uppercase shrink-0">
                {user.firstName ? user.firstName[0] : user.email[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark-100 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-dark-400 font-medium flex items-center space-x-1">
                  <Mail size={11} />
                  <span>{user.email}</span>
                </p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-dark-500 bg-dark-900 px-2 py-1 rounded-lg border border-dark-800">
                {user.status}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-1">
                <UserIcon size={14} className="text-brand-400" />
                <span className="text-xs font-bold uppercase text-dark-400 tracking-wider">
                  Profile
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Shield size={14} className="text-brand-400" />
                <span className="text-xs font-bold uppercase text-dark-400 tracking-wider">
                  Assign Role
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(isSelected ? '' : role.id);
                        setPermissions(
                          isSelected ? [] : ROLE_PERMISSIONS[role.id] || []
                        );
                      }}
                      disabled={loading}
                      className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                        isSelected
                          ? `bg-dark-850/80 ${role.borderColor.split(' ')[0]} ring-1 ring-brand-500/20`
                          : `bg-dark-900/40 border-dark-800 hover:bg-dark-850/60 ${role.borderColor}`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle size={14} className="text-brand-400" />
                        </div>
                      )}
                      <div
                        className={`w-8 h-8 rounded-lg ${role.iconBg} flex items-center justify-center ${role.color} mb-2`}
                      >
                        {role.icon}
                      </div>
                      <p className="text-sm font-bold text-dark-100">{role.title}</p>
                      <p className="text-dark-500 text-[11px] mt-0.5 leading-snug">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles size={14} className="text-brand-400" />
                  <span className="text-xs font-bold uppercase text-dark-400 tracking-wider">
                    Permissions
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-dark-500 bg-dark-850 px-2 py-0.5 rounded-full">
                  {permissions.length}/{AVAILABLE_PERMISSIONS.length}
                </span>
              </div>

              <div className="rounded-xl border border-dark-800 bg-dark-900/40 overflow-hidden">
                <label className="flex items-center space-x-3 px-4 py-2.5 border-b border-dark-800 hover:bg-dark-850/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.length === AVAILABLE_PERMISSIONS.length}
                    onChange={(e) =>
                      setPermissions(
                        e.target.checked ? [...AVAILABLE_PERMISSIONS] : []
                      )
                    }
                    disabled={loading}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-500 cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs font-bold text-dark-200">
                    Full Access (All)
                  </span>
                </label>

                <div className="max-h-36 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-850/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm)}
                        onChange={(e) => {
                          setPermissions((prev) =>
                            e.target.checked
                              ? [...prev, perm]
                              : prev.filter((p) => p !== perm)
                          );
                        }}
                        disabled={loading}
                        className="w-3.5 h-3.5 rounded border-dark-600 bg-dark-800 text-brand-500 cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs text-dark-300 font-medium">
                        {perm}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedRole && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-lg ${selectedRole.iconBg} flex items-center justify-center ${selectedRole.color} shrink-0`}
                >
                  {selectedRole.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-200">
                    Updating role to{' '}
                    <span className="text-amber-400">{selectedRole.title}</span>
                  </p>
                  <p className="text-[10px] text-dark-500 mt-0.5">
                    {permissions.length} permission(s) will be applied
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-800/60 shrink-0 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-dark-400 hover:text-dark-200 transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-user-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-dark-950 transition-all flex items-center space-x-2 border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:hover:shadow-none cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
