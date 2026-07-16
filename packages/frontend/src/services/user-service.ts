import { type User } from '@chat-app/shared/types/user';

import { apiClient } from '@/utils/api-client';

interface UserEnvelope {
  data: User;
}

export interface UpdateMePayload {
  username?: string;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<UserEnvelope>('/users/me');
  return data.data;
}

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const { data } = await apiClient.patch<UserEnvelope>('/users/me', payload);
  return data.data;
}

export async function uploadAvatar(file: File): Promise<User> {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await apiClient.post<UserEnvelope>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
