import { type User } from '@chat-app/shared/types/user';

import { apiClient } from '@/utils/api-client';

interface AuthEnvelope {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

interface TokenEnvelope {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<AuthEnvelope>('/auth/register', payload);
  return data.data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<AuthEnvelope>('/auth/login', payload);
  return data.data;
}

export async function refreshRequest(refreshToken: string): Promise<TokenEnvelope['data']> {
  const { data } = await apiClient.post<TokenEnvelope>('/auth/refresh', { refreshToken });
  return data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}
