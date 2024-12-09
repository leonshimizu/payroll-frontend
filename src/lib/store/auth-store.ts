// src/lib/store/auth-store.ts
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

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage right away
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let initialUser: User | null = null;
  let initialAuth = false;

  if (token && storedUser) {
    setAuthToken(token);
    initialUser = JSON.parse(storedUser);
    initialAuth = true;
  }

  return {
    user: initialUser,
    isAuthenticated: initialAuth,

    async login(email, password) {
      try {
        const response = await api.post('/login', { email, password });
        const { jwt, user } = response.data;

        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(user));

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
      localStorage.removeItem('user');
      setAuthToken(null);
      set({ user: null, isAuthenticated: false });
    },

    checkAuth() {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setAuthToken(token);
        const user: User = JSON.parse(storedUser);
        set({ user, isAuthenticated: true });
      }
    },
  };
});
