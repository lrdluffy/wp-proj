import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // اضافه شد
import { TableSkeleton } from '../components/Skeleton';
import { Plus, Search, Filter } from 'lucide-react';
import type { Case, CaseStatus, CrimeLevel } from '../types';
import { formatDate } from '../utils/format';

const Cases: React.FC = () => {
  const { user } = useAuth(); // دسترسی به اطلاعات کاربر لاگین شده
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCases();
  }, [page, statusFilter, levelFilter, searchTerm]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (levelFilter !== 'all') params.crime_level = levelFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await apiService.getCases(params);
      setCases(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_INVESTIGATION': return 'bg-blue-100 text-blue-800';
      case 'AWAITING_TRIAL': return 'bg-purple-100 text-purple-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: CrimeLevel) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cases</h2>
          <p className="text-gray-600">Manage and track all police cases</p>
        </div>

        {/* منطق نمایش دکمه: فقط اگر کاربر Trainee نباشد دکمه نمایش داده می‌شود */}
        {user?.role !== 'TRAINEE' && (
          <Link
            to="/cases/new"
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Case</span>
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="AWAITING_TRIAL">Awaiting Trial</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setLevelFilter('all');
              setPage(1);
            }}
            className="flex items-center justify-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Filter className="h-5 w-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : cases.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No cases found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Case Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reported</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{caseItem.case_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.title}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status_display}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getLevelColor(caseItem.crime_level)}`}>
                        Level {caseItem.crime_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{caseItem.assigned_to_detail?.full_name || 'Unassigned'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(caseItem.reported_at)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link to={`/cases/${caseItem.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
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

export default Cases;