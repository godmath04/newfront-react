import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

// Roles de aprobadores
const APPROVER_ROLES = ['Editor', 'Revisor Legal', 'Jefe de Redacción'];

const Dashboard = () => {
  const { user, logout, getUserRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  // Verificar si el usuario es reportero
  const isReporter = userRole === 'Reportero';

  // Verificar si el usuario es aprobador
  const isApprover = APPROVER_ROLES.includes(userRole);

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'Administrador';

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, [getUserRole]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navegar a la lista de articulos (solo reporteros)
  const handleGoToArticles = () => {
    navigate('/articles');
  };

  // Navegar a aprobaciones (solo aprobadores)
  const handleGoToApprovals = () => {
    navigate('/approvals');
  };

  // Navegar a administracion de usuarios (solo admin)
  const handleGoToUsers = () => {
    navigate('/admin/users');
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'Reportero':
        return 'Puede crear y enviar artículos para revisión';
      case 'Editor':
        return 'Puede revisar y aprobar artículos desde perspectiva editorial';
      case 'Revisor Legal':
        return 'Puede revisar y aprobar artículos desde perspectiva legal';
      case 'Jefe de Redacción':
        return 'Puede dar la aprobación final a los artículos';
      case 'Administrador':
        return 'Puede gestionar usuarios y configuración del sistema';
      default:
        return 'Usuario del sistema';
    }
  };

  const getRolePermissions = () => {
    switch (userRole) {
      case 'Reportero':
        return [
          'Crear nuevos artículos',
          'Editar artículos propios',
          'Enviar artículos a revisión',
          'Ver estado de sus artículos'
        ];
      case 'Editor':
      case 'Revisor Legal':
      case 'Jefe de Redacción':
        return [
          'Ver artículos pendientes de aprobación',
          'Aprobar o rechazar artículos',
          'Ver historial de aprobaciones',
          'Agregar comentarios a artículos'
        ];
      case 'Administrador':
        return [
          'Gestionar usuarios del sistema',
          'Crear nuevos usuarios',
          'Activar/desactivar usuarios',
          'Configurar roles y permisos',
          'Ver todos los artículos del sistema'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h1 className="nav-title">Portal Periodístico</h1>
        <div className="nav-actions">
          {/* Boton para Reporteros */}
          {isReporter && (
            <button onClick={handleGoToArticles} className="nav-button">
              Mis Articulos
            </button>
          )}

          {/* Boton para Aprobadores */}
          {isApprover && (
            <button onClick={handleGoToApprovals} className="nav-button">
              Aprobaciones
            </button>
          )}

          {/* Boton para Administradores */}
          {isAdmin && (
            <button onClick={handleGoToUsers} className="nav-button">
              Gestionar Usuarios
            </button>
          )}

          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Bienvenido, {user?.username}</h2>
          <div className="user-info-card">
            <div className="info-row">
              <span className="info-label">ID de Usuario:</span>
              <span className="info-value">{user?.userId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Rol:</span>
              <span className="role-badge">{userRole}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Descripción:</span>
              <span className="info-value">{getRoleDescription()}</span>
            </div>
          </div>
        </div>

        <div className="permissions-section">
          <h3>Permisos y Capacidades</h3>
          <ul className="permissions-list">
            {getRolePermissions().map((permission, index) => (
              <li key={index} className="permission-item">
                <span className="permission-icon">✓</span>
                {permission}
              </li>
            ))}
          </ul>
        </div>

        <div className="role-info-section">
          <h3>Información del Sistema de Roles</h3>
          <div className="roles-grid">
            <div className="role-card">
              <h4>Reportero</h4>
              <p>Crea y envía artículos para el proceso de revisión</p>
            </div>
            <div className="role-card">
              <h4>Editor</h4>
              <p>Revisa la calidad editorial de los artículos</p>
            </div>
            <div className="role-card">
              <h4>Revisor Legal</h4>
              <p>Asegura el cumplimiento legal de los contenidos</p>
            </div>
            <div className="role-card">
              <h4>Jefe de Redacción</h4>
              <p>Aprobación final antes de la publicación</p>
            </div>
            <div className="role-card">
              <h4>Administrador</h4>
              <p>Gestiona usuarios y configuración del sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
