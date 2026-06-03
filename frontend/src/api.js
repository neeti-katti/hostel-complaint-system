import axios from 'axios';

// In dev, Vite proxies /api to the backend (see vite.config.js).
const api = axios.create({ baseURL: '/api' });

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
