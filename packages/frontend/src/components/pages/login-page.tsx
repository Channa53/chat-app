import { type FC } from 'react';
import { Link } from 'react-router-dom';

export const LoginPage: FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Login form coming in Phase 2.</p>
        <Link to="/register" className="block text-sm text-primary hover:underline">
          Need an account? Register
        </Link>
      </div>
    </div>
  );
};
