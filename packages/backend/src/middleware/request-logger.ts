import { type RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    console.info(`${method} ${originalUrl} ${statusCode} ${durationMs}ms`);
  });

  next();
};
