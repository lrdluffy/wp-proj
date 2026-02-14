import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { FileText, Upload, Download, Search } from 'lucide-react';
import type { Case } from '../types';
import { format } from 'date-fns';

const Documents: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCases({ page: 1 });
      setCases(data.results);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.case_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Registration & Review</h2>
          <p className="text-gray-600">Manage case documents and evidence files</p>
        </div>
        <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
          <Upload className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by case number or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredCases.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No documents found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Case Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {caseItem.case_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.title}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          caseItem.status === 'CLOSED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {caseItem.status_display}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {format(new Date(caseItem.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>0 files</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Review
                        </button>
                      </div>
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

export default Documents;