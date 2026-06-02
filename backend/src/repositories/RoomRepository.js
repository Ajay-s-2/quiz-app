import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

export class RoomRepository {
  async createRoom(roomCode, roomData) {
    const client = getRedisClient();
    const key = `room:${roomCode}`;

    try {
      await client.hSet(key, {
        roomCode,
        hostId: roomData.hostId,
        quizId: roomData.quizId,
        status: 'waiting', // waiting, active, completed
        currentQuestion: 0,
        createdAt: new Date().toISOString(),
      });

      await client.expire(key, 86400); // 24 hour expiry
      logger.info(`Room created: ${roomCode}`);
      return { roomCode, ...roomData };
    } catch (error) {
      logger.error(`Error creating room: ${error.message}`);
      throw error;
    }
  }

  async getRoom(roomCode) {
    const client = getRedisClient();
    const key = `room:${roomCode}`;

    try {
      const room = await client.hGetAll(key);
      return Object.keys(room).length > 0 ? room : null;
    } catch (error) {
      logger.error(`Error fetching room: ${error.message}`);
      throw error;
    }
  }

  async updateRoom(roomCode, updates) {
    const client = getRedisClient();
    const key = `room:${roomCode}`;

    try {
      await client.hSet(key, updates);
      logger.info(`Room updated: ${roomCode}`);
      return true;
    } catch (error) {
      logger.error(`Error updating room: ${error.message}`);
      throw error;
    }
  }

  async deleteRoom(roomCode) {
    const client = getRedisClient();
    const prefix = `room:${roomCode}`;

    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(keys);
      }
      logger.info(`Room deleted: ${roomCode}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting room: ${error.message}`);
      throw error;
    }
  }
}

export default new RoomRepository();
