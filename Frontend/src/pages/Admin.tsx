import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { Users, Shield, Settings, Search } from 'lucide-react';
import type { User } from '../types';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.role === 'POLICE_CHIEF' || user?.role === 'CAPTAIN') {
      fetchUsers();
    }
  }, [user, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await apiService.getUsers(params);
      setUsers(data.results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
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
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;