import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import api from '../../lib/axios';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  loading: boolean;
  login: (data: { accessToken: string; admin: AdminUser }) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_access_token');
      const savedAdmin = localStorage.getItem('admin_user');
      
      if (token && savedAdmin) {
        try {
          setCurrentAdmin(JSON.parse(savedAdmin));
        } catch (e) {
          console.error("Failed to parse admin_user", e);
        }
      } else {
        // If we don't have token but are on an admin route (not login/accept), try to refresh
        if (location.pathname.startsWith('/admin') && !location.pathname.includes('/login') && !location.pathname.includes('/invite/accept')) {
          await refreshSession();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshSession = async () => {
    try {
      const response = await api.post('/admin/auth/refresh');
      const { accessToken, user } = response.data;
      
      localStorage.setItem('admin_access_token', accessToken);
      // Backend needs to return the user info in refresh
      if (user) {
         setCurrentAdmin(user);
         localStorage.setItem('admin_user', JSON.stringify(user));
      }
      return accessToken;
    } catch (error) {
      console.error("Session refresh failed", error);
      clearAuth();
      if (location.pathname.startsWith('/admin') && !location.pathname.includes('/login') && !location.pathname.includes('/invite/accept')) {
        navigate('/admin/login');
      }
      throw error;
    }
  };

  // Setup Axios Interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_access_token');
      if (token && config.url?.startsWith('/admin')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If 401 Unauthorized and we haven't retried yet, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url?.startsWith('/admin') && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshSession();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, location.pathname]);

  const clearAuth = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    setCurrentAdmin(null);
  };

  const login = (data: { accessToken: string; admin: AdminUser }) => {
    localStorage.setItem('admin_access_token', data.accessToken);
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    setCurrentAdmin(data.admin);
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      clearAuth();
      navigate('/admin/login');
    }
  };

  const hasRole = (roles: string[]) => {
    if (!currentAdmin) return false;
    return roles.includes(currentAdmin.role);
  };

  const hasPermission = (permission: string) => {
    if (!currentAdmin) return false;
    if (currentAdmin.role === 'super-admin') return true;
    return currentAdmin.permissions?.includes(permission) ?? false;
  };

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
