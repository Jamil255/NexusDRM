import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateOrgWithAdminFormData } from '../types/user';

// Re-export for convenience
export type { CreateOrgWithAdminFormData };

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateOrgWithAdminFormData) => Promise<void>;
  loading?: boolean;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateOrgWithAdminFormData>({
    orgName: '',
    plan: 'free',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orgName) {
      newErrors.orgName = 'Organization name is required';
    } else if (formData.orgName.length < 3) {
      newErrors.orgName = 'Organization name must be at least 3 characters';
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }

    if (!formData.adminFirstName) {
      newErrors.adminFirstName = 'Admin first name is required';
    }

    if (!formData.adminLastName) {
      newErrors.adminLastName = 'Admin last name is required';
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setFormData({
        orgName: '',
        plan: 'free',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to create organization');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Organization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">Organization created successfully!</p>
            </div>
          )}

          {/* Organization Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Organization Details</h3>

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="Acme Inc."
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.orgName ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.orgName && (
                <p className="text-red-600 text-sm mt-1">{errors.orgName}</p>
              )}
            </div>

            {/* Plan Selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Admin Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Admin User Details</h3>

            {/* Admin Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email *
              </label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@acme.com"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.adminEmail ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.adminEmail && (
                <p className="text-red-600 text-sm mt-1">{errors.adminEmail}</p>
              )}
            </div>

            {/* Admin First Name */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin First Name *
              </label>
              <input
                type="text"
                name="adminFirstName"
                value={formData.adminFirstName}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.adminFirstName ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.adminFirstName && (
                <p className="text-red-600 text-sm mt-1">{errors.adminFirstName}</p>
              )}
            </div>

            {/* Admin Last Name */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Last Name *
              </label>
              <input
                type="text"
                name="adminLastName"
                value={formData.adminLastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.adminLastName ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.adminLastName && (
                <p className="text-red-600 text-sm mt-1">{errors.adminLastName}</p>
              )}
            </div>

            {/* Admin Password */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password *
              </label>
              <input
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.adminPassword ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.adminPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.adminPassword}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100`}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
