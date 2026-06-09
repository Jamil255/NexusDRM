import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Shield,
  Lock,
  Edit3,
  Eye,
  CheckSquare,
  User,
  Mail,
  UserPlus,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import type { CreateUserFormData } from '../types/user';

export type { CreateUserFormData };

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateUserFormData) => Promise<void>;
  organizationId?: string;
  loading?: boolean;
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
  permissions: string[];
}

const ROLES: Role[] = [
  {
    id: 'org_admin',
    name: 'org_admin',
    title: 'Org Admin',
    description: 'Full access & control',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    iconBg: 'bg-purple-500/15',
    icon: <Shield size={16} />,
    permissions: ['Create users', 'Manage content', 'View analytics', 'Manage settings'],
  },
  {
    id: 'manager',
    name: 'manager',
    title: 'Manager',
    description: 'Content & user mgmt',
    color: 'text-brand-400',
    borderColor: 'border-brand-500/30 hover:border-brand-500/60',
    iconBg: 'bg-brand-500/15',
    icon: <UserPlus size={16} />,
    permissions: ['Create users', 'Manage content', 'View analytics'],
  },
  {
    id: 'editor',
    name: 'editor',
    title: 'Editor',
    description: 'Create & edit content',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    iconBg: 'bg-amber-500/15',
    icon: <Edit3 size={16} />,
    permissions: ['Create content', 'Edit own content', 'Upload files'],
  },
  {
    id: 'viewer',
    name: 'viewer',
    title: 'Viewer',
    description: 'Read-only access',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/30 hover:border-slate-500/60',
    iconBg: 'bg-slate-500/15',
    icon: <Eye size={16} />,
    permissions: ['View content', 'Download content'],
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

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    permissions: [],
    organizationId: organizationId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      setSubmitError(null);
      setSubmitSuccess(false);
      setErrors({});
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        permissions: [],
        organizationId: organizationId || '',
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.firstName) e.firstName = 'Required';
    if (!formData.lastName) e.lastName = 'Required';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    if (!validate()) return;

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        handleClose();
        setSubmitSuccess(false);
      }, 1500);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to create user');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 250);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !loading) handleClose();
  };

  const selectedRole = ROLES.find((r) => r.id === formData.roleId);

  // Password strength
  const pwStrength = formData.password
    ? (formData.password.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(formData.password) ? 1 : 0) +
      (/[0-9]/.test(formData.password) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(formData.password) ? 1 : 0)
    : 0;

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`glass-card w-full max-w-2xl rounded-2xl border border-dark-700/60 shadow-2xl shadow-black/40 flex flex-col max-h-[94vh] transition-all duration-300 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-dark-800/60 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/6 to-transparent rounded-t-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-dark-50 tracking-tight">Create New User</h2>
                <p className="text-dark-400 text-xs font-medium mt-0.5">Add a team member with role & permissions</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} disabled={loading}
              className="p-2 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-800 hover:border-dark-700 text-dark-400 hover:text-dark-200 transition-all cursor-pointer disabled:opacity-40">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="create-user-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Alerts */}
            {submitSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-3 animate-fade-in-up">
                <CheckCircle size={17} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-bold text-sm">User Created!</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">Account is active and a welcome email has been sent.</p>
                </div>
              </div>
            )}
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3 animate-fade-in-up">
                <AlertCircle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-300 font-bold text-sm">Creation Failed</p>
                  <p className="text-rose-400/70 text-xs mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {/* ─── User Information ─── */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User size={13} className="text-brand-400" />
                <span className="text-[11px] font-bold uppercase text-dark-400 tracking-wider">User Information</span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                  Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"><Mail size={14} /></span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="user@company.com" disabled={loading}
                    className={`w-full pl-9 pr-4 py-2 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium ${errors.email ? '!border-rose-500/50 !ring-1 !ring-rose-500/20' : ''}`} />
                </div>
                {errors.email && <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1"><AlertCircle size={11} /><span>{errors.email}</span></p>}
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="John" disabled={loading}
                    className={`w-full px-3 py-2 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium ${errors.firstName ? '!border-rose-500/50 !ring-1 !ring-rose-500/20' : ''}`} />
                  {errors.firstName && <p className="text-rose-400 text-[11px] font-semibold mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Doe" disabled={loading}
                    className={`w-full px-3 py-2 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium ${errors.lastName ? '!border-rose-500/50 !ring-1 !ring-rose-500/20' : ''}`} />
                  {errors.lastName && <p className="text-rose-400 text-[11px] font-semibold mt-1">{errors.lastName}</p>}
                </div>
              </div>
            </div>

            {/* ─── Password ─── */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <KeyRound size={13} className="text-brand-400" />
                <span className="text-[11px] font-bold uppercase text-dark-400 tracking-wider">Password</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"><Lock size={14} /></span>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                      placeholder="••••••••" disabled={loading}
                      className={`w-full pl-9 pr-4 py-2 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium ${errors.password ? '!border-rose-500/50 !ring-1 !ring-rose-500/20' : ''}`} />
                  </div>
                  {errors.password && <p className="text-rose-400 text-[11px] font-semibold mt-1">{errors.password}</p>}
                  {formData.password && (
                    <div className="flex items-center space-x-2 mt-1.5">
                      <div className="flex space-x-0.5 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= pwStrength ? (pwStrength <= 1 ? 'bg-rose-500' : pwStrength <= 2 ? 'bg-amber-500' : pwStrength <= 3 ? 'bg-brand-500' : 'bg-emerald-500') : 'bg-dark-800'
                          }`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-dark-500 font-medium w-10">
                        {pwStrength <= 1 ? 'Weak' : pwStrength <= 2 ? 'Fair' : pwStrength <= 3 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-400 tracking-wider mb-1.5">
                    Confirm <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"><Lock size={14} /></span>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="••••••••" disabled={loading}
                      className={`w-full pl-9 pr-4 py-2 glass-input text-sm text-dark-100 placeholder:text-dark-600 font-medium ${errors.confirmPassword ? '!border-rose-500/50 !ring-1 !ring-rose-500/20' : ''}`} />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"><CheckCircle size={14} /></span>
                    )}
                  </div>
                  {errors.confirmPassword && <p className="text-rose-400 text-[11px] font-semibold mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* ─── Role ─── */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield size={13} className="text-brand-400" />
                <span className="text-[11px] font-bold uppercase text-dark-400 tracking-wider">Role</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map((role) => {
                  const isSel = formData.roleId === role.id;
                  return (
                    <button key={role.id} type="button" disabled={loading}
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        roleId: isSel ? '' : role.id,
                        permissions: isSel ? prev.permissions : role.permissions,
                      }))}
                      className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isSel
                          ? `bg-dark-850/80 ${role.borderColor.split(' ')[0]} ring-1 ring-brand-500/20`
                          : `bg-dark-900/40 border-dark-800 hover:bg-dark-850/60 ${role.borderColor}`
                      }`}>
                      {isSel && <div className="absolute top-1.5 right-1.5"><CheckCircle size={12} className="text-brand-400" /></div>}
                      <div className={`w-7 h-7 rounded-lg ${role.iconBg} flex items-center justify-center ${role.color} mb-1.5`}>{role.icon}</div>
                      <p className="text-xs font-bold text-dark-100">{role.title}</p>
                      <p className="text-dark-500 text-[10px] mt-0.5 leading-snug">{role.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Permissions ─── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles size={13} className="text-brand-400" />
                  <span className="text-[11px] font-bold uppercase text-dark-400 tracking-wider">Permissions</span>
                </div>
                <span className="text-[10px] font-semibold text-dark-500 bg-dark-850 px-2 py-0.5 rounded-full">
                  {formData.permissions?.length || 0}/{AVAILABLE_PERMISSIONS.length}
                </span>
              </div>
              <div className="rounded-xl border border-dark-800 bg-dark-900/40 overflow-hidden">
                <label className="flex items-center space-x-3 px-3 py-2 border-b border-dark-800 hover:bg-dark-850/50 cursor-pointer transition-colors">
                  <input type="checkbox"
                    checked={formData.permissions?.length === AVAILABLE_PERMISSIONS.length}
                    onChange={(e) => setFormData((prev) => ({ ...prev, permissions: e.target.checked ? [...AVAILABLE_PERMISSIONS] : [] }))}
                    disabled={loading}
                    className="w-3.5 h-3.5 rounded border-dark-600 bg-dark-800 cursor-pointer accent-emerald-500" />
                  <span className="text-xs font-bold text-dark-200">Full Access (All)</span>
                </label>
                <div className="max-h-28 overflow-y-auto grid grid-cols-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-850/30 cursor-pointer transition-colors">
                      <input type="checkbox"
                        checked={(formData.permissions || []).includes(perm)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...(formData.permissions || []), perm]
                            : (formData.permissions || []).filter((p) => p !== perm);
                          setFormData((prev) => ({ ...prev, permissions: updated }));
                        }}
                        disabled={loading}
                        className="w-3 h-3 rounded border-dark-600 bg-dark-800 cursor-pointer accent-emerald-500" />
                      <span className="text-[11px] text-dark-300 font-medium">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-dark-800/60 shrink-0 flex items-center justify-between">
          {selectedRole && (
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-lg ${selectedRole.iconBg} flex items-center justify-center ${selectedRole.color}`}>{selectedRole.icon}</div>
              <span className="text-[11px] text-dark-400 font-medium">
                Role: <span className="text-dark-200 font-bold">{selectedRole.title}</span>
              </span>
            </div>
          )}
          {!selectedRole && <div />}
          <div className="flex items-center space-x-3">
            <button type="button" onClick={handleClose} disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-dark-400 hover:text-dark-200 transition-colors cursor-pointer disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" form="create-user-form" disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-brand-500 hover:bg-brand-400 text-dark-950 transition-all flex items-center space-x-2 border border-brand-400 hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 disabled:hover:shadow-none cursor-pointer">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" /><span>Creating...</span></>
              ) : (
                <><CheckSquare size={15} /><span>Create User</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
