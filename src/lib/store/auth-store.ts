import { create } from 'zustand';
import api, { setAuthToken } from '@/lib/api';

interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      const { jwt, user } = response.data;
      localStorage.setItem('token', jwt);
      setAuthToken(jwt);
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    setAuthToken(null);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Optionally, we can fetch current user info, but let's assume token decode or separate endpoint.
      // For now, we can set isAuthenticated = true. If we need user data, we can call a /me endpoint.
      // Example:
      api.get('/me')
        .then((res) => {
          set({ user: res.data.user, isAuthenticated: true });
        })
        .catch(() => {
          setAuthToken(null);
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        });
    }
  },
}));
