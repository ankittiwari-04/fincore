/// <reference types="node" />

import dotenv from 'dotenv';

dotenv.config();

const frontendOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  : [];

/**
 * Validated environment configuration object
 */
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string,
  /** Comma-separated browser origins allowed to call the API (production CORS). Example: https://myapp.vercel.app */
  frontendOrigins,
};

if (!config.jwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

if (!config.databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const dbUrl = config.databaseUrl.trim();
if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
  throw new Error(
    'DATABASE_URL must start with postgresql:// or postgres:// (Prisma P1012). Fix your .env or Render environment — remove stray quotes and use your full Neon/host URL.'
  );
}
