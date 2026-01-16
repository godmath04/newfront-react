// API Configuration - Backend Microservices
export const API_CONFIG = {
  auth: 'http://localhost:8081',
  article: 'http://localhost:8082',
  suggestion: 'http://localhost:8083'
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_CONFIG.auth}/auth/login`,
  GET_USER: (userId) => `${API_CONFIG.auth}/auth/users/${userId}`
};

// Article endpoints
export const ARTICLE_ENDPOINTS = {
  GET_ALL: `${API_CONFIG.article}/api/v1/articles`,
  GET_BY_AUTHOR: (authorId) => `${API_CONFIG.article}/api/v1/articles/author/${authorId}`,
  GET_ONE: (id) => `${API_CONFIG.article}/api/v1/articles/${id}`,
  CREATE: `${API_CONFIG.article}/api/v1/articles`,
  UPDATE: (id) => `${API_CONFIG.article}/api/v1/articles/${id}`,
  DELETE: (id) => `${API_CONFIG.article}/api/v1/articles/${id}`,
  SEND_TO_REVIEW: (id) => `${API_CONFIG.article}/api/v1/articles/${id}/send-to-review`,
  GET_PENDING: `${API_CONFIG.article}/api/v1/articles/pending`
};

// Approval endpoints
export const APPROVAL_ENDPOINTS = {
  GET_PENDING: `${API_CONFIG.article}/api/v1/approvals/pending`,
  PROCESS: `${API_CONFIG.article}/api/v1/approvals`,
  GET_HISTORY: (articleId) => `${API_CONFIG.article}/api/v1/approvals/article/${articleId}`
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  GET_USERS: `${API_CONFIG.auth}/admin/users`,
  CREATE_USER: `${API_CONFIG.auth}/admin/users`,
  UPDATE_USER: (id) => `${API_CONFIG.auth}/admin/users/${id}`,
  DELETE_USER: (id) => `${API_CONFIG.auth}/admin/users/${id}`
};

// Token storage key
export const TOKEN_KEY = 'auth_token';
