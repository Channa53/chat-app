import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js';
import { requestLogger } from '@/middleware/request-logger.js';
import { authRouter } from '@/routes/auth-routes.js';
import { healthRouter } from '@/routes/health-routes.js';
import { prisma } from '@/utils/prisma.js';

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  await prisma.$connect();
  console.info('Database connected');

  const server = app.listen(PORT, () => {
    console.info(`Backend listening on http://localhost:${PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.info(`${signal} received, shutting down`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

start().catch((err: unknown) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
