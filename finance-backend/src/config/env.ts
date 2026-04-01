import dotenv from 'dotenv';

dotenv.config();

/**
 * Validated environment configuration object
 */
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string,
};

if (!config.jwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

if (!config.databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}
