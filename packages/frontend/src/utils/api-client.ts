import { type ApiError } from '@chat-app/shared/types/api-response';
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth-store';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly details: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
  _skipAuth?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer access token unless _skipAuth is set
apiClient.interceptors.request.use((config) => {
  const retryConfig = config as RetryConfig;
  if (!retryConfig._skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Singleflight so concurrent 401s don't all kick off a refresh
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new ApiClientError('Not authenticated', 401, 'MISSING_TOKEN');
  }

  try {
    const { data } = await apiClient.post<{
      data: { accessToken: string; refreshToken: string };
    }>('/auth/refresh', { refreshToken }, { _skipAuth: true } as RetryConfig);

    useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } catch (err) {
    useAuthStore.getState().clear();
    throw err;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const config = error.config as RetryConfig | undefined;
    const apiError = error.response?.data?.error;

    const isExpired =
      error.response?.status === 401 &&
      (apiError?.code === 'TOKEN_EXPIRED' || apiError?.code === 'INVALID_TOKEN');

    if (isExpired && config && !config._retried && !config._skipAuth) {
      config._retried = true;
      try {
        refreshPromise ??= performRefresh().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(config);
      } catch {
        // refresh already cleared the store
      }
    }

    if (error.response?.data?.error) {
      const { message, code, details } = error.response.data.error;
      throw new ApiClientError(message, error.response.status, code, details);
    }
    throw new ApiClientError(error.message, error.response?.status ?? 0);
  }
);
