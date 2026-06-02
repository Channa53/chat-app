import { type User } from '@chat-app/shared/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'authenticated' | 'unauthenticated';
}

interface AuthActions {
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  markUnauthenticated: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'idle',

      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, status: 'authenticated' }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      clear: () =>
        set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' }),

      markUnauthenticated: () => set({ status: 'unauthenticated' }),
    }),
    {
      name: 'chat-app:auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
