import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://visitor-pass-system-1-tbxg.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vps_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vps_token');
      localStorage.removeItem('vps_user');
      if (!window.location.hash.startsWith('#/login')) {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
