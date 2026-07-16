import { type User } from '@prisma/client';

import { type UpdateMeInput } from '@/schemas/user-schemas.js';
import { AppError } from '@/utils/app-error.js';
import { prisma } from '@/utils/prisma.js';

export type PublicUser = Omit<User, 'passwordHash'>;

function strip(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function getById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }
  return strip(user);
}

export async function updateProfile(userId: string, input: UpdateMeInput): Promise<PublicUser> {
  if (input.username) {
    const existing = await prisma.user.findUnique({
      where: { username: input.username },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw AppError.conflict('Username already taken', 'USERNAME_TAKEN');
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: input,
  });
  return strip(updated);
}

export async function setAvatar(userId: string, avatarUrl: string): Promise<PublicUser> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });
  return strip(updated);
}
