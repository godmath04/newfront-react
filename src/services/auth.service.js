import axios from 'axios';
import { AUTH_ENDPOINTS, TOKEN_KEY } from '../config/api.config';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, credentials);
      const { token, userId, username, roles } = response.data;

      // Store token in localStorage
      this.setToken(token);

      return { token, userId, username, roles };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Store token
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Get token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Check if user is logged in
  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate > new Date();
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Decode JWT token manually (without external library)
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Get current user from token
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      console.log('JWT Payload:', payload); // Debug log
      console.log('Roles from JWT:', payload.roles); // Debug log

      return {
        userId: payload.userId,
        username: payload.sub,
        roles: payload.roles || []
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user roles
  getRoles() {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  // Get username
  getUsername() {
    const user = this.getCurrentUser();
    return user?.username || null;
  }

  // Get user ID
  getUserId() {
    const user = this.getCurrentUser();
    return user?.userId || null;
  }

  // Check if user has specific role
  hasRole(roleName) {
    const roles = this.getRoles();
    return roles.some(role => {
      if (typeof role === 'string') {
        return role === roleName;
      }
      return role.roleName === roleName || role.authority === roleName;
    });
  }

  // Check if user has any of the specified roles
  hasAnyRole(roleNames) {
    const roles = this.getRoles();
    return roles.some(role => {
      const roleValue = typeof role === 'string' ? role : (role.roleName || role.authority);
      return roleNames.includes(roleValue);
    });
  }

  // Get primary role (first role)
  getPrimaryRole() {
    const roles = this.getRoles();
    if (roles.length === 0) return null;

    // Handle both object format {roleName: "..."} and string format
    const firstRole = roles[0];
    if (typeof firstRole === 'string') {
      return firstRole;
    } else if (firstRole && firstRole.roleName) {
      return firstRole.roleName;
    } else if (firstRole && firstRole.authority) {
      // Some JWT tokens use "authority" instead of "roleName"
      return firstRole.authority;
    }

    console.warn('Unknown role format:', firstRole);
    return null;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.data || 'Error de autenticación';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No se pudo conectar con el servidor');
    } else {
      // Something else happened
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Export singleton instance
export default new AuthService();
