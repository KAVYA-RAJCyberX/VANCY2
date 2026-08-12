import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the correct token on every request
api.interceptors.request.use((config) => {
  if (!import.meta.env.VITE_API_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured in environment variables"));
  }

  try {
    const isAdminRoute = config.url?.startsWith('/admin');

    if (isAdminRoute) {
      const adminToken = localStorage.getItem('admin_access_token');
      if (adminToken && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }

    const authStorage = localStorage.getItem('vancy-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed.state?.user?.token;
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error parsing auth storage for token interceptor:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auto-refresh admin token on 401 and retry the original request
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Check if we accidentally received HTML (usually means VITE_API_URL is wrong)
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error("API returned HTML instead of JSON. Ensure VITE_API_URL is pointing to the backend."));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isAdminRoute = originalRequest?.url?.startsWith('/admin');
    const is401 = error.response?.status === 401;
    const isRefreshRoute = originalRequest?.url?.includes('/auth/refresh');

    if (isAdminRoute && is401 && !isRefreshRoute && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/admin/auth/refresh');
        const newToken = data.accessToken;
        localStorage.setItem('admin_access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — token is truly expired, redirect to login
        localStorage.removeItem('admin_access_token');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

