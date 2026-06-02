import redis from 'redis';
import { config } from './index.js';
import logger from './logger.js';

let redisClient;

export const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      database: config.redis.db,
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis Client Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected Successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error.message}`);
    process.exit(1);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis first.');
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    logger.info('Redis Client Disconnected');
  }
};

export default redisClient;
