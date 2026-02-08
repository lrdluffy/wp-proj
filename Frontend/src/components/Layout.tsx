import React, { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, FileText, Shield, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <h1 className="text-xl font-bold">Police System</h1>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/cases"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/cases') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Cases</span>
            </Link>

            <Link
              to="/detective-board"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/detective-board') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Detective Board</span>
            </Link>

            <Link
              to="/pursuit"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/pursuit') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Under Pursuit</span>
            </Link>

            <Link
              to="/complaints"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/complaints') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Complaints</span>
            </Link>

            <Link
              to="/reports"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/reports') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Reports</span>
            </Link>

            <Link
              to="/documents"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                isActive('/documents') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Documents</span>
            </Link>

            {(user?.role === 'POLICE_CHIEF' || user?.role === 'CAPTAIN') && (
              <Link
                to="/admin"
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="border-t border-gray-800 p-4">
            <div className="mb-3 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-semibold">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-400">{user?.role_display}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/cases' && 'Cases'}
              {location.pathname === '/detective-board' && 'Detective Board'}
              {location.pathname === '/pursuit' && 'Under Intense Pursuit'}
              {location.pathname === '/complaints' && 'Complaints'}
              {location.pathname === '/reports' && 'Reports'}
              {location.pathname === '/documents' && 'Documents'}
              {location.pathname === '/admin' && 'Admin Panel'}
            </h2>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;