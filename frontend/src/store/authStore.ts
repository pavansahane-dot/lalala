import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: string;
  role: string;
  adminRole?: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: () => ({ user: null }),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
