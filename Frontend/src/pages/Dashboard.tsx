import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { FileText, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { Case } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    closedCases: 0,
    activeComplaints: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesData, complaintsData] = await Promise.all([
          apiService.getCases({ page: 1 }),
          apiService.getComplaints({ page: 1 }),
        ]);

        const cases = casesData.results;
        setRecentCases(cases.slice(0, 5));
        
        setStats({
          totalCases: casesData.count,
          pendingCases: cases.filter((c) => c.status === 'PENDING').length,
          closedCases: cases.filter((c) => c.is_closed).length,
          activeComplaints: complaintsData.results.filter(
            (c) => c.status !== 'CLOSED' && c.status !== 'REJECTED'
          ).length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.first_name || user?.username}!</h2>
        <p className="text-gray-600">Here's an overview of your system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCases}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Cases</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pendingCases}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed Cases</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.closedCases}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Complaints</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.activeComplaints}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
            <Link
              to="/cases"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentCases.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No cases found
            </div>
          ) : (
            recentCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/cases/${caseItem.id}`}
                className="block px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{caseItem.title}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {caseItem.case_number} • {caseItem.status_display}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        caseItem.crime_level === 1
                          ? 'bg-red-100 text-red-800'
                          : caseItem.crime_level === 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Level {caseItem.crime_level}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to="/cases/new"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create New Case</p>
              <p className="text-sm text-gray-600">Register a new case file</p>
            </div>
          </div>
        </Link>

        <Link
          to="/complaints"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Complaints</p>
              <p className="text-sm text-gray-600">Review and process complaints</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Generate Reports</p>
              <p className="text-sm text-gray-600">View analytics and reports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;