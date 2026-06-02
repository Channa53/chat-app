import { randomUUID } from 'node:crypto';

import { type User } from '@prisma/client';
import bcrypt from 'bcrypt';
import ms, { type StringValue } from 'ms';

import { type LoginInput, type RegisterInput } from '@/schemas/auth-schemas.js';
import { AppError } from '@/utils/app-error.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt.js';
import { prisma } from '@/utils/prisma.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends TokenPair {
  user: Omit<User, 'passwordHash'>;
}

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);
const REFRESH_TTL: StringValue = (process.env.JWT_REFRESH_TTL ?? '7d') as StringValue;

function stripPassword(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

async function issueTokensForUser(user: User): Promise<TokenPair> {
  const accessToken = generateAccessToken({ sub: user.id, role: user.role });

  const jti = randomUUID();
  const refreshToken = generateRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + ms(REFRESH_TTL));

  await prisma.refreshToken.create({
    data: { id: jti, userId: user.id, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    if (existing.email === input.email) {
      throw AppError.conflict('Email already in use', 'EMAIL_TAKEN');
    }
    throw AppError.conflict('Username already taken', 'USERNAME_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, username: input.username, passwordHash },
  });

  const tokens = await issueTokensForUser(user);
  return { user: stripPassword(user), ...tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) {
    throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokensForUser(user);
  return { user: stripPassword(user), ...tokens };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true },
  });

  if (!stored || stored.token !== refreshToken || stored.revokedAt || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token is no longer valid', 'INVALID_TOKEN');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokensForUser(stored.user);
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Silently ignore invalid tokens on logout — the goal is best-effort revocation.
  }
}
