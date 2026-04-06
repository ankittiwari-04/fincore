import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { AppError } from './utils/AppError';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import recordRoutes from './routes/record.route';
import dashboardRoutes from './routes/dashboard.route';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
const app = express();

if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Middleware — restrict CORS in production when FRONTEND_URL is set
if (config.frontendOrigins.length > 0) {
  app.use(
    cors({
      origin: config.frontendOrigins,
    })
  );
} else {
  app.use(cors());
}
app.use(express.json());

// Root — register before /api so it always wins; HTML for browsers, JSON for clients
app.get('/', (req: Request, res: Response) => {
  const payload = {
    status: 'success',
    name: 'FinCore API',
    message: 'Backend is running. Use /health for a quick check; API routes are under /api.',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      records: '/api/records',
      dashboard: '/api/dashboard',
    },
  };
  if (req.accepts('html')) {
    res
      .status(200)
      .type('html')
      .send(
        `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>FinCore API</title><style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.5}code{background:#f4f4f5;padding:.15rem .35rem;border-radius:4px}a{color:#2563eb}</style></head><body><h1>FinCore API</h1><p>Service is live. This URL is the <strong>REST API</strong> — open your app frontend or use the links below.</p><ul><li><a href="/health">GET /health</a> — status check</li><li><a href="/api">/api</a> — use Postman or your SPA with <code>VITE_API_URL</code></li></ul><pre>${JSON.stringify(payload, null, 2)}</pre></body></html>`
      );
    return;
  }
  res.status(200).json(payload);
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Use prefixed routes, e.g. POST /api/auth/login, GET /api/dashboard/summary',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let errStatus = 'error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errStatus = err.status;

    if (err.isOperational) {
      // Operational, trusted error: send message to client
      res.status(statusCode).json({
        status: errStatus,
        message: err.message,
      });
      return;
    }
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errStatus = 'fail';
    res.status(statusCode).json({
      status: errStatus,
      message: 'Validation Error',
      errors: err.errors,
    });
    return;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      errStatus = 'fail';
      res.status(statusCode).json({
        status: errStatus,
        message: 'Resource already exists',
      });
      return;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      errStatus = 'fail';
      res.status(statusCode).json({
        status: errStatus,
        message: 'Record not found',
      });
      return;
    }
  } else if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    errStatus = 'fail';
    res.status(statusCode).json({
      status: errStatus,
      message: 'Invalid or expired token',
    });
    return;
  }

  // Programming or other unknown error
  if (config.nodeEnv === 'development') {
    res.status(statusCode).json({
      status: errStatus,
      error: err,
      message: err.message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
});

export default app;

