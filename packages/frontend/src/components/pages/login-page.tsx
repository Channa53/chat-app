import { EMAIL_REGEX } from '@chat-app/shared/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button, Input } from '@/design-system';
import { loginRequest } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';
import { ApiClientError } from '@/utils/api-client';

const loginSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { from?: string } | null };
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues): Promise<void> => {
    setServerError(null);
    try {
      const result = await loginRequest(values);
      setSession(result.user, result.accessToken, result.refreshToken);
      navigate(location.state?.from ?? '/chat', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError('Unexpected error');
      }
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-8"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <Link to="/register" className="block text-center text-sm text-primary hover:underline">
          Need an account? Register
        </Link>
      </form>
    </div>
  );
};
