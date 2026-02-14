import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { Shield, User, FileText, Clock } from 'lucide-react';
import type { Case, User as UserType } from '../types';
import { format } from 'date-fns';

const DetectiveBoard: React.FC = () => {
  const { user } = useAuth();
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [detectives, setDetectives] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesData, usersData] = await Promise.all([
        apiService.getCases({ status: 'UNDER_INVESTIGATION' }),
        apiService.getUsers({ role: 'DETECTIVE' }),
      ]);

      setAssignedCases(casesData.results);
      
      // Filter cases assigned to current user if they're a detective
      if (user?.role === 'DETECTIVE') {
        setAssignedCases(casesData.results.filter((c) => c.assigned_to === user.id));
      }

      setDetectives(usersData.results);
    } catch (error) {
      console.error('Error fetching detective board data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Detective Board</h2>
        <p className="text-gray-600">Manage active investigations and detective assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{assignedCases.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Detectives</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{detectives.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {assignedCases.filter((c) => c.assigned_to === user?.id).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Cases */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Investigations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {assignedCases.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No active cases under investigation
            </div>
          ) : (
            assignedCases.map((caseItem) => (
              <div key={caseItem.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/cases/${caseItem.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {caseItem.title}
                      </Link>
                      <span className="text-sm text-gray-500">#{caseItem.case_number}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Reported: {format(new Date(caseItem.reported_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {caseItem.assigned_to_detail && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Assigned to: {caseItem.assigned_to_detail.full_name}</span>
                        </div>
                      )}
                    </div>
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detectives List */}
      {(user?.role === 'CAPTAIN' || user?.role === 'POLICE_CHIEF') && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Detectives</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
            {detectives.map((detective) => (
              <div
                key={detective.id}
                className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-semibold text-blue-600">
                      {detective.first_name?.[0] || detective.username[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{detective.full_name}</p>
                    <p className="text-sm text-gray-600">{detective.badge_number || 'No badge'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectiveBoard;