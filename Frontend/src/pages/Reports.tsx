import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { BarChart3, PieChart, TrendingUp, FileText } from 'lucide-react';

const Reports: React.FC = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    casesByStatus: {} as Record<string, number>,
    casesByLevel: {} as Record<number, number>,
    totalComplaints: 0,
    complaintsByStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [casesData, complaintsData] = await Promise.all([
        apiService.getCases({ page: 1 }),
        apiService.getComplaints({ page: 1 }),
      ]);

      const cases = casesData.results;
      const complaints = complaintsData.results;

      const casesByStatus: Record<string, number> = {};
      const casesByLevel: Record<number, number> = {};
      const complaintsByStatus: Record<string, number> = {};

      cases.forEach((c) => {
        casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
        casesByLevel[c.crime_level] = (casesByLevel[c.crime_level] || 0) + 1;
      });

      complaints.forEach((c) => {
        complaintsByStatus[c.status] = (complaintsByStatus[c.status] || 0) + 1;
      });

      setStats({
        totalCases: casesData.count,
        casesByStatus,
        casesByLevel,
        totalComplaints: complaintsData.count,
        complaintsByStatus,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive statistics and insights</p>
      </div>

      {/* Summary Cards */}
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
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalComplaints}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Cases</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {stats.casesByStatus['PENDING'] || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed Cases</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats.casesByStatus['CLOSED'] || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <PieChart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cases by Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Cases by Status</h3>
        <div className="space-y-3">
          {Object.entries(stats.casesByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {status.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${(count / stats.totalCases) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-gray-900">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases by Level */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Cases by Crime Level</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`rounded-lg p-4 ${
                level === 1
                  ? 'bg-red-50 border border-red-200'
                  : level === 2
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Level {level}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.casesByLevel[level] || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints by Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Complaints by Status</h3>
        <div className="space-y-3">
          {Object.entries(stats.complaintsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {status.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-600"
                    style={{
                      width: `${(count / stats.totalComplaints) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-medium text-gray-900">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;