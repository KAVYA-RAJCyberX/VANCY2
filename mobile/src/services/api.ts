import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Note: Use EXPO_PUBLIC_API_URL in .env, falling back to typical Android emulator localhost if missing.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState().user?.token;
    
    // Prevent unnecessary CORS preflight on public catalog endpoints (similar to web)
    const isPublicGet = config.method?.toLowerCase() === 'get' && config.url?.startsWith('/products');

    if (token && config.headers && !config.headers.Authorization && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token from store:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error("API returned HTML instead of JSON. Ensure EXPO_PUBLIC_API_URL is pointing to the backend."));
    }
    return response;
  },
  async (error) => {
    // 401 handling if needed later (e.g. forced logout)
    if (error.response?.status === 401) {
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
