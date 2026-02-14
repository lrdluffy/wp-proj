import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { AlertTriangle, MapPin, Clock, User } from 'lucide-react';
import type { Case } from '../types';
import { formatDateTime } from '../utils/format';

const Pursuit: React.FC = () => {
  const [pursuitCases, setPursuitCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPursuitCases();
  }, []);

  const fetchPursuitCases = async () => {
    setLoading(true);
    try {
      // Fetch cases that are under investigation and high priority (Level 1 or 2)
      const data = await apiService.getCases({
        status: 'UNDER_INVESTIGATION',
      });
      
      // Filter for high-priority cases (Level 1 and 2)
      const highPriorityCases = data.results.filter(
        (c) => c.crime_level === 1 || c.crime_level === 2
      );
      
      setPursuitCases(highPriorityCases);
    } catch (error) {
      console.error('Error fetching pursuit cases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Under Intense Pursuit</h2>
          <p className="text-gray-600">High-priority cases requiring immediate attention</p>
        </div>
        <div className="flex items-center space-x-2 rounded-lg bg-red-100 px-4 py-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="font-medium text-red-800">{pursuitCases.length} Active</span>
        </div>
      </div>

      {pursuitCases.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No cases under intense pursuit</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pursuitCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className={`rounded-lg border-2 p-6 shadow-lg transition-shadow hover:shadow-xl ${
                caseItem.crime_level === 1
                  ? 'border-red-500 bg-red-50'
                  : 'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/cases/${caseItem.id}`}
                    className="text-lg font-bold text-gray-900 hover:text-blue-600"
                  >
                    {caseItem.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">#{caseItem.case_number}</p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    caseItem.crime_level === 1
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}
                >
                  LEVEL {caseItem.crime_level}
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-700 line-clamp-3">{caseItem.description}</p>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                {caseItem.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{caseItem.location}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Reported: {formatDateTime(caseItem.reported_at)}</span>
                </div>

                {caseItem.assigned_to_detail && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Assigned: {caseItem.assigned_to_detail.full_name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/cases/${caseItem.id}`}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pursuit;