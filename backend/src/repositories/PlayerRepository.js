import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

export class PlayerRepository {
  async addPlayer(roomCode, playerId, playerData) {
    const client = getRedisClient();
    const setKey = `room:${roomCode}:players`;
    const playerKey = `room:${roomCode}:player:${playerId}`;

    try {
      // Add player to set
      await client.sAdd(setKey, playerId);

      // Store player data
      await client.hSet(playerKey, {
        playerId,
        name: playerData.name,
        joinedAt: new Date().toISOString(),
        score: 0,
      });

      logger.info(`Player ${playerId} added to room ${roomCode}`);
      return true;
    } catch (error) {
      logger.error(`Error adding player: ${error.message}`);
      throw error;
    }
  }

  async removePlayer(roomCode, playerId) {
    const client = getRedisClient();
    const setKey = `room:${roomCode}:players`;
    const playerKey = `room:${roomCode}:player:${playerId}`;

    try {
      await client.sRem(setKey, playerId);
      await client.del(playerKey);
      logger.info(`Player ${playerId} removed from room ${roomCode}`);
      return true;
    } catch (error) {
      logger.error(`Error removing player: ${error.message}`);
      throw error;
    }
  }

  async getPlayer(roomCode, playerId) {
    const client = getRedisClient();
    const playerKey = `room:${roomCode}:player:${playerId}`;

    try {
      const player = await client.hGetAll(playerKey);
      return Object.keys(player).length > 0 ? player : null;
    } catch (error) {
      logger.error(`Error fetching player: ${error.message}`);
      throw error;
    }
  }

  async getPlayers(roomCode) {
    const client = getRedisClient();
    const setKey = `room:${roomCode}:players`;

    try {
      const playerIds = await client.sMembers(setKey);
      const players = [];

      for (const playerId of playerIds) {
        const playerKey = `room:${roomCode}:player:${playerId}`;
        const player = await client.hGetAll(playerKey);
        if (Object.keys(player).length > 0) {
          players.push(player);
        }
      }

      return players;
    } catch (error) {
      logger.error(`Error fetching players: ${error.message}`);
      throw error;
    }
  }

  async getPlayerCount(roomCode) {
    const client = getRedisClient();
    const setKey = `room:${roomCode}:players`;

    try {
      return await client.sCard(setKey);
    } catch (error) {
      logger.error(`Error getting player count: ${error.message}`);
      throw error;
    }
  }

  async updatePlayerScore(roomCode, playerId, score) {
    const client = getRedisClient();
    const playerKey = `room:${roomCode}:player:${playerId}`;
    const scoresKey = `room:${roomCode}:scores`;

    try {
      await client.hSet(playerKey, { score });
      await client.zAdd(scoresKey, { score: parseInt(score, 10), member: playerId });
      logger.info(`Player ${playerId} score updated to ${score}`);
      return true;
    } catch (error) {
      logger.error(`Error updating player score: ${error.message}`);
      throw error;
    }
  }
}

export default new PlayerRepository();
