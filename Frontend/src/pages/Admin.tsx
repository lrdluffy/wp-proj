import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { Users, Shield, Settings, Search, X, AlertCircle, Save } from 'lucide-react';
import type { User } from '../types';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (user?.role === 'POLICE_CHIEF' || user?.role === 'CAPTAIN') {
      fetchUsers();
    }
  }, [user, roleFilter, debouncedSearchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;

      const data = await apiService.getUsers(params);
      setUsers(data.results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (userItem: User) => {
    try {
      // Fetch full user details
      const fullUser = await apiService.getUser(userItem.id);
      setEditingUser(fullUser);
      setFormData({
        username: fullUser.username,
        email: fullUser.email,
        first_name: fullUser.first_name,
        last_name: fullUser.last_name,
        role: fullUser.role,
        badge_number: fullUser.badge_number || '',
        phone_number: fullUser.phone_number || '',
        is_active: fullUser.is_active,
      });
      setError(null);
      setSuccess(false);
      setEditModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      const updatedUser = await apiService.updateUser(editingUser.id, formData);
      
      // Update the user in the list
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      setSuccess(true);
      setTimeout(() => {
        setEditModalOpen(false);
        setEditingUser(null);
        setFormData({});
        setSuccess(false);
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        error.message ||
        'Failed to update user';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setFormData({});
    setError(null);
    setSuccess(false);
  };

  if (user?.role !== 'POLICE_CHIEF' && user?.role !== 'CAPTAIN') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-500">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-gray-600">Manage users and system settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {users.filter((u) => u.is_active).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Detectives</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {users.filter((u) => u.role === 'DETECTIVE').length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, email, badge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-10 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="TRAINEE">Trainee</option>
              <option value="MEDICAL_EXAMINER">Medical Examiner</option>
              <option value="POLICE_OFFICER">Police Officer</option>
              <option value="PATROL_OFFICER">Patrol Officer</option>
              <option value="DETECTIVE">Detective</option>
              <option value="SERGEANT">Sergeant</option>
              <option value="CAPTAIN">Captain</option>
              <option value="POLICE_CHIEF">Police Chief</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Badge Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-semibold text-blue-600">
                            {userItem.first_name?.[0] || userItem.username[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.full_name}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{userItem.role_display}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {userItem.badge_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{userItem.email}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          userItem.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(userItem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit user"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingUser.full_name} ({editingUser.username})
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {success ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">User updated successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      >
                        <option value="TRAINEE">Trainee</option>
                        <option value="MEDICAL_EXAMINER">Medical Examiner</option>
                        <option value="POLICE_OFFICER">Police Officer</option>
                        <option value="PATROL_OFFICER">Patrol Officer</option>
                        <option value="DETECTIVE">Detective</option>
                        <option value="SERGEANT">Sergeant</option>
                        <option value="CAPTAIN">Captain</option>
                        <option value="POLICE_CHIEF">Police Chief</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Badge Number
                      </label>
                      <input
                        type="text"
                        name="badge_number"
                        value={formData.badge_number || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active ?? true}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
                        Active User
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!success && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCloseModal}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;