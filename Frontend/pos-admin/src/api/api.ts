// Frontend/pos-admin/src/api/api.ts
import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const baseURL = configuredBaseURL.replace(/\/+$/, '').endsWith('/api')
  ? configuredBaseURL.replace(/\/+$/, '')
  : `${configuredBaseURL.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk mengirim token (jika sudah implementasi login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 by attempting refresh token flow
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response ? error.response.status : null;
    // Only try refresh once per request
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      if (!refreshToken) return Promise.reject(error);

      try {
        // Use axios directly to call refresh endpoint to avoid interceptor recursion
        const res = await axios.post(`${baseURL}/refresh`, { refresh_token: refreshToken }, { headers: { 'Content-Type': 'application/json' } });
        const data = res.data;
        if (data && data.data) {
          const access = data.data.access_token;
          const refresh = data.data.refresh_token;
          // Store tokens in the same storage the user used
          if (localStorage.getItem('token') || localStorage.getItem('user')) {
            localStorage.setItem('token', access);
            localStorage.setItem('refresh_token', refresh);
          } else {
            sessionStorage.setItem('token', access);
            sessionStorage.setItem('refresh_token', refresh);
          }
          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed — clear auth and reject
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refresh_token');
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
