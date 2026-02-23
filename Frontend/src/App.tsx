import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Role } from './types';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseCreate from './pages/CaseCreate';
import CaseDetail from './pages/CaseDetail';
import CaseEdit from './pages/CaseEdit';
import ComplaintList from './pages/ComplaintList';
import ComplaintForm from './pages/ComplaintForm';
import DetectiveBoard from './pages/DetectiveBoard';
import Pursuit from './pages/Pursuit';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Admin from './pages/Admin';

const RoleBasedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (!user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complaints" element={<ComplaintList />} />
            <Route path="/complaints/new" element={<ComplaintForm />} />
            <Route path="/complaints/edit/:id" element={<ComplaintForm />} />

            <Route
              element={
                <RoleBasedRoute allowedRoles={[
                  Role.POLICE_OFFICER,
                  Role.PATROL_OFFICER,
                  Role.DETECTIVE,
                  Role.SERGEANT,
                  Role.CAPTAIN,
                  Role.POLICE_CHIEF
                ]} />
              }
            >
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/new" element={<CaseCreate />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/cases/:id/edit" element={<CaseEdit />} />
              <Route path="/pursuit" element={<Pursuit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/documents" element={<Documents />} />
            </Route>

            <Route
              element={
                <RoleBasedRoute allowedRoles={[
                  Role.DETECTIVE,
                  Role.SERGEANT,
                  Role.CAPTAIN,
                  Role.POLICE_CHIEF
                ]} />
              }
            >
              <Route path="/detective-board" element={<DetectiveBoard />} />
            </Route>

            <Route
              element={
                <RoleBasedRoute allowedRoles={[Role.POLICE_CHIEF, Role.CAPTAIN]} />
              }
            >
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;