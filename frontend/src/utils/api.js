import axios from 'axios';
import logger from './logger';

const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDevelopment) {
    return 'http://localhost:3000/api';
  }
  return '/api';
};

const API_BASE_URL = getApiUrl();

logger.info('API Configuration', {
  baseURL: API_BASE_URL,
  environment: process.env.NODE_ENV,
  hostname: window.location.hostname,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug('Token added to request', {
        url: config.url,
        hasToken: true,
      });
    } else {
      logger.debug('Request without token', {
        url: config.url,
        hasToken: false,
      });
    }

    logger.apiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || 'UNKNOWN',
      config.data,
      config.headers
    );

    return config;
  },
  (error) => {
    logger.error('Request interceptor error', {
      error: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : null;

    logger.apiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || 'UNKNOWN',
      response.status,
      response.data,
      duration
    );

    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : null;

    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';

    logger.apiError(method, url, error, duration);

    if (!error.response) {
      const networkError = {
        message: 'Network error. Please check your connection and ensure the backend server is running.',
        isNetworkError: true,
        originalError: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      };

      logger.error('Network Error Details', {
        ...networkError,
        suggestion: 'Check if backend server is running on ' + API_BASE_URL,
      });

      return Promise.reject(networkError);
    }

    const status = error.response?.status;
    const responseData = error.response?.data;

    if (status === 401) {
      logger.warn('Unauthorized access - clearing auth data', {
        url,
        message: responseData?.message,
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        logger.info('Redirecting to login page');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        ...error,
        message: responseData?.message || 'Unauthorized. Please login again.',
        isAuthError: true,
      });
    }

    if (status === 403) {
      logger.warn('Forbidden access', {
        url,
        message: responseData?.message,
        userRole: JSON.parse(localStorage.getItem('user') || '{}')?.role,
      });

      return Promise.reject({
        ...error,
        message: responseData?.message || 'Access denied. You do not have permission to perform this action.',
        isForbidden: true,
      });
    }

    if (status === 400 && responseData?.errors) {
      logger.warn('Validation error', {
        url,
        errors: responseData.errors,
        message: responseData.message,
      });

      return Promise.reject({
        ...error,
        message: Array.isArray(responseData.errors) 
          ? responseData.errors.join(', ') 
          : responseData.message || 'Validation failed',
        validationErrors: responseData.errors,
        isValidationError: true,
      });
    }

    if (status === 404) {
      logger.warn('Resource not found', {
        url,
        message: responseData?.message,
      });
    }

    if (status >= 500) {
      logger.error('Server error', {
        url,
        status,
        message: responseData?.message,
        data: responseData,
      });
    }

    const errorMessage = responseData?.message || error.message || 'An error occurred';
    
    logger.warn('API Error Response', {
      url,
      status,
      message: errorMessage,
      data: responseData,
    });

    return Promise.reject({
      ...error,
      message: errorMessage,
      status,
      responseData,
    });
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const borrowAPI = {
  create: (data) => api.post('/borrow', data),
  getMyRequests: () => api.get('/borrow/my-requests'),
  getMyHistory: () => api.get('/borrow/my-history'),
  getById: (id) => api.get(`/borrow/${id}`),
  getAll: (params) => api.get('/borrow', { params }),
  update: (id, data) => api.put(`/borrow/${id}`, data),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;

