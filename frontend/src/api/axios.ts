import axios from 'axios';

/**
 * Production default points at the deployed API. Override anytime with VITE_API_URL on Vercel / local .env.
 */
function resolveBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return 'http://localhost:3001/api';
  return 'https://fincore-n72l.onrender.com/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fincore_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fincore_token');
      localStorage.removeItem('fincore_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
