import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  register: (data) => authAxios.post('/auth/register', data),
  login: (data) => authAxios.post('/auth/login', data),
  me: (token) => authAxios.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export default authAxios;
