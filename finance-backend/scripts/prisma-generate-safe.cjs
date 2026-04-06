/**
 * Prisma validates DATABASE_URL format during `prisma generate`.
 * If it's missing or not postgres://, use a placeholder URL (generate does not connect).
 */
const { execSync } = require('child_process');

const raw = (process.env.DATABASE_URL || '').trim();
const ok = /^postgres(ql)?:\/\//i.test(raw);

if (!ok) {
  console.warn(
    '[fin-core] DATABASE_URL missing or not postgresql:// — using a build-only placeholder for prisma generate.'
  );
  process.env.DATABASE_URL =
    'postgresql://build:build@127.0.0.1:5432/build?schema=public';
}

execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
