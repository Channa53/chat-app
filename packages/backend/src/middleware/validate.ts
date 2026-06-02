import { type RequestHandler } from 'express';
import { type ZodType } from 'zod';

import { AppError } from '@/utils/app-error.js';

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      }));
      next(AppError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
      return;
    }
    req.body = result.data;
    next();
  };
}
