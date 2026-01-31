import axios from 'axios';
let accessToken = null;
export function setAccessToken(t){ accessToken = t; }
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', withCredentials: true });
api.interceptors.request.use(cfg => {
  if(accessToken){ cfg.headers = cfg.headers || {}; cfg.headers.Authorization = `Bearer ${accessToken}`; }
  return cfg;
});
api.interceptors.response.use(r=>r, async err => {
  const original = err.config;
  if(err.response && err.response.status === 401 && !original._retry){
    original._retry = true;
    try {
      const r = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/auth/refresh', {}, { withCredentials: true });
      const newToken = r.data?.accessToken;
      setAccessToken(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch(e){ return Promise.reject(e); }
  }
  return Promise.reject(err);
});
export default api;
