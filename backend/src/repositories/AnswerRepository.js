import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

export class AnswerRepository {
  async submitAnswer(roomCode, questionIndex, playerId, answer) {
    const client = getRedisClient();
    const answerKey = `room:${roomCode}:answers:${questionIndex}`;

    try {
      await client.hSet(answerKey, {
        [playerId]: answer,
      });
      logger.info(`Answer submitted for room ${roomCode}, question ${questionIndex}, player ${playerId}`);
      return true;
    } catch (error) {
      logger.error(`Error submitting answer: ${error.message}`);
      throw error;
    }
  }

  async getAnswerForPlayer(roomCode, questionIndex, playerId) {
    const client = getRedisClient();
    const answerKey = `room:${roomCode}:answers:${questionIndex}`;

    try {
      return await client.hGet(answerKey, playerId);
    } catch (error) {
      logger.error(`Error fetching player answer: ${error.message}`);
      throw error;
    }
  }

  async getAllAnswers(roomCode, questionIndex) {
    const client = getRedisClient();
    const answerKey = `room:${roomCode}:answers:${questionIndex}`;

    try {
      return await client.hGetAll(answerKey);
    } catch (error) {
      logger.error(`Error fetching all answers: ${error.message}`);
      throw error;
    }
  }

  async clearAnswers(roomCode, questionIndex) {
    const client = getRedisClient();
    const answerKey = `room:${roomCode}:answers:${questionIndex}`;

    try {
      await client.del(answerKey);
      logger.info(`Answers cleared for room ${roomCode}, question ${questionIndex}`);
      return true;
    } catch (error) {
      logger.error(`Error clearing answers: ${error.message}`);
      throw error;
    }
  }

  async hasPlayerAnswered(roomCode, questionIndex, playerId) {
    const client = getRedisClient();
    const answerKey = `room:${roomCode}:answers:${questionIndex}`;

    try {
      const exists = await client.hExists(answerKey, playerId);
      return exists === 1;
    } catch (error) {
      logger.error(`Error checking answer existence: ${error.message}`);
      throw error;
    }
  }
}

export default new AnswerRepository();
