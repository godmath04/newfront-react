import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!credentials.username || !credentials.password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        // Check if error is related to inactive user
        const errorMessage = result.error.toLowerCase();
        if (errorMessage.includes('inactive') || errorMessage.includes('desactiv')) {
          setShowInactiveModal(true);
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeInactiveModal = () => {
    setShowInactiveModal(false);
    setCredentials({ username: '', password: '' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Portal Periodístico</h1>
        <h2 className="login-subtitle">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Ingrese su usuario"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Ingrese su contraseña"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>

      {/* Inactive User Modal */}
      {showInactiveModal && (
        <div className="modal-overlay" onClick={closeInactiveModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Usuario Inactivo</h3>
            <p>Su cuenta ha sido desactivada. Por favor contacte al administrador.</p>
            <button onClick={closeInactiveModal} className="modal-button">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
