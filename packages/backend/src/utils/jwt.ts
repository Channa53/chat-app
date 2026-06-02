import jwt, { type SignOptions } from 'jsonwebtoken';

import { AppError } from '@/utils/app-error.js';

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  const secret = requireEnv('JWT_ACCESS_SECRET');
  const expiresIn = process.env.JWT_ACCESS_TTL ?? '15m';
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const secret = requireEnv('JWT_REFRESH_SECRET');
  const expiresIn = process.env.JWT_REFRESH_TTL ?? '7d';
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, requireEnv('JWT_ACCESS_SECRET'));
    if (typeof decoded === 'string' || !decoded.sub) {
      throw AppError.unauthorized('Invalid access token', 'INVALID_TOKEN');
    }
    return { sub: String(decoded.sub), role: String(decoded.role ?? 'USER') };
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token expired', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid access token', 'INVALID_TOKEN');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, requireEnv('JWT_REFRESH_SECRET'));
    if (typeof decoded === 'string' || !decoded.sub || !decoded.jti) {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }
    return { sub: String(decoded.sub), jti: String(decoded.jti) };
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Refresh token expired', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
  }
}
