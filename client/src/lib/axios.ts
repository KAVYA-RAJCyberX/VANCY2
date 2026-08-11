import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to the Express backend
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const isAdminRoute = config.url?.startsWith('/admin');
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('admin_access_token');
      if (adminToken && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config; // Early return to avoid overwriting
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

export default api;
