import RoomRepository from '../repositories/RoomRepository.js';
import PlayerRepository from '../repositories/PlayerRepository.js';
import QuizRepository from '../repositories/QuizRepository.js';
import AnswerRepository from '../repositories/AnswerRepository.js';
import { generateRoomCode, generatePlayerId } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

export class RoomService {
  async createRoom(quizId, hostId) {
    try {
      let roomCode;
      let attempts = 0;

      // Generate unique room code
      do {
        roomCode = generateRoomCode();
        const existingRoom = await RoomRepository.getRoom(roomCode);
        attempts++;
        if (attempts > 10) {
          throw new AppError('Failed to generate unique room code', 500);
        }
      } while (existingRoom);

      const room = await RoomRepository.createRoom(roomCode, {
        hostId,
        quizId,
      });

      logger.info(`Room created with code ${roomCode} by host ${hostId}`);
      return { roomCode };
    } catch (error) {
      logger.error(`Error creating room: ${error.message}`);
      throw error;
    }
  }

  async getRoom(roomCode) {
    try {
      const room = await RoomRepository.getRoom(roomCode);
      if (!room) {
        throw new AppError('Room not found', 404);
      }

      const players = await PlayerRepository.getPlayers(roomCode);
      return { ...room, players };
    } catch (error) {
      logger.error(`Error fetching room: ${error.message}`);
      throw error;
    }
  }

  async joinRoom(roomCode, playerName) {
    try {
      const room = await RoomRepository.getRoom(roomCode);
      if (!room) {
        throw new AppError('Room not found', 404);
      }

      if (room.status === 'completed') {
        throw new AppError('This quiz has ended', 400);
      }

      const playerId = generatePlayerId();
      await PlayerRepository.addPlayer(roomCode, playerId, { name: playerName });

      const players = await PlayerRepository.getPlayers(roomCode);
      logger.info(`Player ${playerName} joined room ${roomCode}`);

      return { playerId, roomCode, players };
    } catch (error) {
      logger.error(`Error joining room: ${error.message}`);
      throw error;
    }
  }

  async startQuiz(roomCode, hostId) {
    try {
      const room = await RoomRepository.getRoom(roomCode);
      if (!room) {
        throw new AppError('Room not found', 404);
      }

      if (room.hostId !== hostId) {
        throw new AppError('Only host can start quiz', 403);
      }

      await RoomRepository.updateRoom(roomCode, {
        status: 'active',
        startedAt: new Date().toISOString(),
      });

      logger.info(`Quiz started in room ${roomCode}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error starting quiz: ${error.message}`);
      throw error;
    }
  }

  async endQuiz(roomCode) {
    try {
      const room = await RoomRepository.getRoom(roomCode);
      if (!room) {
        throw new AppError('Room not found', 404);
      }

      await RoomRepository.updateRoom(roomCode, {
        status: 'completed',
        endedAt: new Date().toISOString(),
      });

      logger.info(`Quiz ended in room ${roomCode}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error ending quiz: ${error.message}`);
      throw error;
    }
  }

  async deleteRoom(roomCode) {
    try {
      await RoomRepository.deleteRoom(roomCode);
      logger.info(`Room ${roomCode} deleted`);
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting room: ${error.message}`);
      throw error;
    }
  }
}

export default new RoomService();
