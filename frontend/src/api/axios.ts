import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh on 401
let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    // Only attempt refresh on 401, not on the refresh endpoint itself
    if (error.response?.status === 401 && !original._retry && original.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        // No refresh token — redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
