import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import JobListings from './pages/JobListings';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import AdminDashboard from './pages/AdminDashboard';
import ManageJobs from './pages/ManageJobs';
import ManageStudents from './pages/ManageStudents';
import AdminApplications from './pages/AdminApplications';

// Protected Route wrappers
const ProtectedStudentRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="app-shell">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="app-body">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="main-content">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={isAuthenticated ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Login />} />
            <Route path="/register" element={isAuthenticated ? (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Register />} />

            {/* Root Route */}
            <Route 
              path="/" 
              element={
                isAuthenticated 
                  ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />)
                  : <Navigate to="/login" replace />
              } 
            />

            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
            <Route path="/jobs" element={<ProtectedStudentRoute><JobListings /></ProtectedStudentRoute>} />
            <Route path="/profile" element={<ProtectedStudentRoute><StudentProfile /></ProtectedStudentRoute>} />
            <Route path="/applications" element={<ProtectedStudentRoute><Applications /></ProtectedStudentRoute>} />
            <Route path="/saved-jobs" element={<ProtectedStudentRoute><SavedJobs /></ProtectedStudentRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/jobs" element={<ProtectedAdminRoute><ManageJobs /></ProtectedAdminRoute>} />
            <Route path="/admin/students" element={<ProtectedAdminRoute><ManageStudents /></ProtectedAdminRoute>} />
            <Route path="/admin/applications" element={<ProtectedAdminRoute><AdminApplications /></ProtectedAdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
