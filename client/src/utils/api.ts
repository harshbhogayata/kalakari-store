import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';
import config from '../config/env';

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true,
});

// SECURITY UPDATE: Tokens now stored in httpOnly cookies + CSRF protection
// Request interceptor updated to work with cookies and CSRF
api.interceptors.request.use(
  (config) => {
    // DEVELOPMENT ONLY: Support localStorage fallback for testing
    if (process.env.NODE_ENV === 'development') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // CSRF Protection: Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      const csrfToken = localStorage.getItem('csrfToken');
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    // In production, tokens are automatically sent via httpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // SECURITY UPDATE: Clear both localStorage and httpOnly cookies handled on server
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('token'); // Development fallback
      }
      // Redirect to login - server will clear httpOnly cookies automatically
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
