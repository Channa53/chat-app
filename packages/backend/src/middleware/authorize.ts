import { type RequestHandler } from 'express';

import { AppError } from '@/utils/app-error.js';

export function authorize(...allowedRoles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required', 'MISSING_TOKEN'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions', 'FORBIDDEN'));
      return;
    }
    next();
  };
}
