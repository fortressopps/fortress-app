/**
 * backend/src/server.ts
 * Server Factory — versão v7.14-prime
 *
 * Regras do método v7 aplicadas:
 * - Express sempre criado como função pura (createServer)
 * - Zero estado global, zero dependência circular
 * - Hardening baseline: JSON limits, no x-powered-by, helmet-lite
 * - Logging invisível ao invasor, útil para dev/ops
 * - Tratamento global de erros padronizado
 * - Health + readiness
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppError } from './utils/appError.js';
import { logger } from './utils/logger.js';

// Rotas (você já enviou controllers; rotas virão depois)
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import supermarketRoutes from './routes/supermarket.js';

export function createServer() {
  const app = express();

  // ==============================
  // HARDENING BASELINE v7
  // ==============================

  // Remove fingerprint
  app.disable('x-powered-by');

  // Helmet (modo seguro e minimalista)
  app.use(
    helmet({
      contentSecurityPolicy: false, // API backend não serve HTML
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS (modo estrito v7; frontend normalmente roda em localhost:3000)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );

  // Body parsers endurecidos
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // Cookies para refresh tokens
  app.use(cookieParser());

  // ==============================
  // HEALTH ENDPOINTS
  // ==============================

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  app.get('/ready', (req: Request, res: Response) => {
    // Serviço está sempre ready após boot; checagens específicas podem ser adicionadas
    res.status(200).json({ ready: true });
  });

  // ==============================
  // ROUTES
  // ==============================

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/supermarkets', supermarketRoutes);

  // ==============================
  // NOT FOUND
  // ==============================

  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
  });

  // ==============================
  // GLOBAL ERROR HANDLER (v7)
  // ==============================

  app.use(
    (err: AppError, req: Request, res: Response, _next: NextFunction) => {
      logger.error(
        {
          message: err.message,
          code: err.statusCode,
          path: req.originalUrl,
          method: req.method,
        },
        'API Error'
      );

      res.status(err.statusCode || 500).json({
        status: 'error',
        message:
          process.env.APP_ENV === 'development'
            ? err.message
            : 'Internal server error',
      });
    }
  );

  return app;
}

export default createServer;
