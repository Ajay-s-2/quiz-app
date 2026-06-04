import dotenv from 'dotenv';

dotenv.config();

const defaultCorsOrigins = 'http://localhost:5173,http://127.0.0.1:5173';
const corsOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    corsOrigins,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
