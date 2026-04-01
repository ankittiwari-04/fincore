import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { AppError } from './utils/AppError';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// routes will be mounted here in Day 2+

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

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
