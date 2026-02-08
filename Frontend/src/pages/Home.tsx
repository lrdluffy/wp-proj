import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Users, BarChart3 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Police Case Management System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive system for managing police cases, complaints, and investigations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Management</h3>
            <p className="text-gray-600 text-sm">
              Track and manage all police cases with detailed information and status updates
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detective Board</h3>
            <p className="text-gray-600 text-sm">
              Coordinate investigations and manage detective assignments
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Pursuits</h3>
            <p className="text-gray-600 text-sm">
              Monitor and manage cases under intense pursuit
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-600 text-sm">
              Generate comprehensive reports and view analytics
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;