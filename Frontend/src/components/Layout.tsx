import React, { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, FileText, Shield, BarChart3, Settings, FilePlus, Inbox } from 'lucide-react';
import { Role } from '../types';

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
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  const role = user?.role as Role;
  const isCitizen = role === Role.CITIZEN;
  const isStaff = !isCitizen && role !== Role.TRAINEE; // رده‌های عملیاتی پلیس
  const hasDetectiveAccess = [Role.DETECTIVE, Role.SERGEANT, Role.CAPTAIN, Role.POLICE_CHIEF].includes(role);
  const hasAdminAccess = [Role.POLICE_CHIEF, Role.CAPTAIN].includes(role);

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">
      <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-gray-900 text-white shadow-lg overflow-y-auto">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-gray-800 shrink-0">
            <h1 className="text-xl font-bold text-blue-400">Police System</h1>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                isActive('/dashboard') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {isCitizen ? (
              <>
                <Link
                  to="/complaints/new"
                  className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                    isActive('/complaints/new') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <FilePlus className="h-5 w-5 text-green-400" />
                  <span>New Complaint</span>
                </Link>
                <Link
                  to="/complaints"
                  className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                    isActive('/complaints') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Inbox className="h-5 w-5 text-orange-400" />
                  <span>My Complaints</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/complaints"
                  className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                    isActive('/complaints') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Inbox className="h-5 w-5 text-yellow-400" />
                  <span>Manage Complaints</span>
                </Link>

                {isStaff && (
                  <>
                    <Link
                      to="/cases"
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                        isActive('/cases') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span>Cases</span>
                    </Link>

                    {hasDetectiveAccess && (
                      <Link
                        to="/detective-board"
                        className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                          isActive('/detective-board') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Shield className="h-5 w-5 text-purple-400" />
                        <span>Detective Board</span>
                      </Link>
                    )}

                    <Link
                      to="/pursuit"
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                        isActive('/pursuit') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Shield className="h-5 w-5 text-red-400" />
                      <span>Under Pursuit</span>
                    </Link>

                    <Link
                      to="/reports"
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                        isActive('/reports') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <BarChart3 className="h-5 w-5 text-cyan-400" />
                      <span>Reports</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {hasAdminAccess && (
              <Link
                to="/admin"
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                  isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="border-t border-gray-800 p-4 shrink-0">
            <div className="mb-3 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shrink-0">
                <span className="text-sm font-semibold text-white">
                  {user?.username?.[0].toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-white">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role_display || user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-red-900/30 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm h-16 flex items-center px-6 shrink-0">
            <h2 className="text-xl font-semibold text-gray-800">
              {isActive('/dashboard') && 'Dashboard'}
              {isActive('/cases') && 'Cases'}
              {isActive('/detective-board') && 'Detective Board'}
              {isActive('/pursuit') && 'Under Pursuit'}
              {isActive('/complaints') && 'Complaints Management'}
              {isActive('/complaints/new') && 'Submit New Complaint'}
              {location.pathname.includes('/complaints/edit') && 'Edit Complaint'}
              {isActive('/reports') && 'Reports'}
              {isActive('/admin') && 'Admin Panel'}
            </h2>
        </header>
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;