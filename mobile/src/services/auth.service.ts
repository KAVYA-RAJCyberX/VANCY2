import api from './api';
import { User } from '../store/useAuthStore';

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // Assuming the backend returns the User object including token
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error on server', err);
  }
};
