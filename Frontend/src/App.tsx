import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import CaseEdit from './pages/CaseEdit';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseCreate from './pages/CaseCreate';
import CaseDetail from './pages/CaseDetail';
import Complaints from './pages/Complaints';
import DetectiveBoard from './pages/DetectiveBoard';
import Pursuit from './pages/Pursuit';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <Layout>
                  <Cases />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cases/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CaseCreate />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CaseDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <Layout>
                  <Complaints />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/detective-board"
            element={
              <ProtectedRoute>
                <Layout>
                  <DetectiveBoard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pursuit"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pursuit />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Documents />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />
            <Route
            path="/cases/:id/edit"
            element={
              <ProtectedRoute>
               <Layout>
        <CaseEdit />
      </Layout>
    </ProtectedRoute>
  }
/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;