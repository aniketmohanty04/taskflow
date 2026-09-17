import axios from 'axios';

// ─── API Base Configuration ───────────────────────────────────────────────────
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('todo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('todo_token');
      localStorage.removeItem('todo_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ─── Task API Calls ───────────────────────────────────────────────────────────
export const taskAPI = {
  // READ ALL — with optional filters
  getAll: (params = {}) => api.get('/tasks', { params }),

  // READ ONE
  getById: (id) => api.get(`/tasks/${id}`),

  // CREATE
  create: (data) => api.post('/tasks', data),

  // UPDATE (full)
  update: (id, data) => api.put(`/tasks/${id}`, data),

  // PATCH (partial)
  patch: (id, data) => api.patch(`/tasks/${id}`, data),

  // DELETE ONE
  delete: (id) => api.delete(`/tasks/${id}`),

  // DELETE ALL
  deleteAll: () => api.delete('/tasks'),

  // STATS
  getStats: () => api.get('/tasks/stats'),
};

// ─── User API Calls ───────────────────────────────────────────────────────────
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
