import { type RequestHandler } from 'express';

import { AppError } from '@/utils/app-error.js';
import { verifyAccessToken } from '@/utils/jwt.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Missing access token', 'MISSING_TOKEN'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
};
