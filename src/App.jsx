import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Import axios interceptor to initialize it
import './utils/axios.interceptor';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-based Protected Routes Examples */}
          {/*
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['Administrador']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/articles/create"
            element={
              <ProtectedRoute requiredRoles={['Reportero']}>
                <CreateArticle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute requiredRoles={['Editor', 'Revisor Legal', 'Jefe de Redacción']}>
                <Approvals />
              </ProtectedRoute>
            }
          />
          */}

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
