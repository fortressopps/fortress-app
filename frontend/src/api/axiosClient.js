import axios from 'axios';

let accessToken = null;

export function setAccessToken(t) {
  accessToken = t;
}

export function clearAccessToken() {
  accessToken = null;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Inject Bearer token on every request
api.interceptors.request.use((cfg) => {
  if (accessToken) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${accessToken}`;
  }
  return cfg;
});

// On 401: attempt refresh once, then redirect to /login
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;

    // Only retry once and only for 401 responses
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const r = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = r.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        // Refresh failed — clear token and redirect to login
        clearAccessToken();

        // Prevent redirect loop if:
        // 1. The request that failed is the refresh call itself
        // 2. The user is already on the login page
        const isRefreshCall = original.url?.includes('/auth/refresh');
        const isAlreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';

        if (!isRefreshCall && !isAlreadyOnLogin) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  }
);

export default api;
