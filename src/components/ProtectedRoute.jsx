import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#c33', marginBottom: '10px' }}>Acceso Denegado</h2>
        <p style={{ color: '#666' }}>No tiene permisos para acceder a esta página.</p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
