import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (authService.isLoggedIn()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Get user role
  const getUserRole = () => {
    return authService.getPrimaryRole();
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    return authService.hasRole(roleName);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleNames) => {
    return authService.hasAnyRole(roleNames);
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserRole,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
