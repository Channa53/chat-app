import { type FC, type ReactNode, useEffect, useRef } from 'react';

import { refreshRequest } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const { refreshToken, user } = useAuthStore.getState();

    if (!refreshToken || !user) {
      useAuthStore.getState().markUnauthenticated();
      return;
    }

    void (async () => {
      try {
        const tokens = await refreshRequest(refreshToken);
        useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken);
      } catch {
        useAuthStore.getState().clear();
      }
    })();
  }, []);

  return <>{children}</>;
};
