import { type FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth-store';

export const ProtectedRoute: FC = () => {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'idle') {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};
