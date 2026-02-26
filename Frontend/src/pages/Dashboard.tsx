import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { FileText, AlertCircle, TrendingUp, PlusCircle } from 'lucide-react';
import type { Case } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isCitizen = user?.role === 'CITIZEN';

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
          !isCitizen ? apiService.getCases({ page: 1 }) : Promise.resolve({ results: [], count: 0 }),
          apiService.getComplaints({ page: 1 }),
        ]);

        const cases = casesData.results || [];
        setRecentCases(cases.slice(0, 5));

        setStats({
          totalCases: casesData.count || 0,
          pendingCases: cases.filter((c: any) => c.status === 'PENDING').length,
          closedCases: cases.filter((c: any) => c.is_closed).length,
          activeComplaints: complaintsData.results.filter(
            (c: any) => c.status !== 'CLOSED' && c.status !== 'REJECTED'
          ).length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCitizen]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.first_name || user?.username}!</h2>
        <p className="text-gray-600">{isCitizen ? "Manage your complaints here" : "System overview and management"}</p>
      </div>

      {/* Stats Cards - Conditional Rendering */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {!isCitizen && (
          <>
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
            {/* ... Pending and Closed cards can go here for Police only ... */}
          </>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{isCitizen ? "Your Active Complaints" : "Active Complaints"}</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.activeComplaints}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases Section - Hidden for Citizens */}
      {!isCitizen && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
            <Link to="/cases" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCases.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No cases found</div>
            ) : (
              recentCases.map((caseItem) => (
                <Link key={caseItem.id} to={`/cases/${caseItem.id}`} className="block px-6 py-4 hover:bg-gray-50">
                   {caseItem.title} - {caseItem.case_number}
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Tailored for Roles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {isCitizen ? (
          <Link to="/complaints/new" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md border-l-4 border-l-blue-600">
            <div className="flex items-center space-x-3">
              <PlusCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">Submit New Complaint</p>
                <p className="text-sm text-gray-600">Report a new incident</p>
              </div>
            </div>
          </Link>
        ) : (
          <>
            <Link to="/cases/new" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md">
               <FileText className="text-blue-600" /> Create New Case
            </Link>
            <Link to="/reports" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md">
               <TrendingUp className="text-purple-600" /> Generate Reports
            </Link>
          </>
        )}

        <Link to="/complaints" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md">
          <AlertCircle className="text-yellow-600" /> {isCitizen ? "My Complaints" : "View All Complaints"}
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;