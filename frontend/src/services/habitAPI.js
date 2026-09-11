import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res,
  err => Promise.reject(new Error(err.response?.data?.message || err.message || 'Something went wrong'))
);

export const habitAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

export const completionAPI = {
  getByMonth: (month) => api.get('/completions', { params: { month } }),
  getChart: (days = 30) => api.get('/completions/chart', { params: { days } }),
  toggle: (taskId, date) => api.post('/completions/toggle', { taskId, date }),
};

export default api;
