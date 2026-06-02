import { Server } from 'socket.io';
import { config } from '../config/index.js';
import logger from '../config/logger.js';
import PlayerRepository from '../repositories/PlayerRepository.js';
import RoomRepository from '../repositories/RoomRepository.js';
import QuizRepository from '../repositories/QuizRepository.js';
import ScoringService from '../services/ScoringService.js';

class SocketManager {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.app.corsOrigin,
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Middleware to verify socket connections
    this.io.use((socket, next) => {
      logger.info(`Socket connection attempt: ${socket.id}`);
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Room events - properly binding with socket context
      socket.on('join-room', (data, callback) => this.handleJoinRoom(socket, data, callback));
      socket.on('leave-room', (data, callback) => this.handleLeaveRoom(socket, data, callback));
      socket.on('start-quiz', (data, callback) => this.handleStartQuiz(socket, data, callback));
      socket.on('submit-answer', (data, callback) => this.handleSubmitAnswer(socket, data, callback));
      socket.on('next-question', (data, callback) => this.handleNextQuestion(socket, data, callback));
      socket.on('end-quiz', (data, callback) => this.handleEndQuiz(socket, data, callback));

      // Connection events
      socket.on('disconnect', () => this.handleDisconnect(socket));
      socket.on('error', (error) => {
        logger.error(`Socket error: ${error.message}`);
      });
    });
  }

  async handleJoinRoom(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, playerName } = data;

    try {
      // Get or create player in room
      const players = await PlayerRepository.getPlayers(roomCode);
      const room = await RoomRepository.getRoom(roomCode);

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      if (room.status === 'completed') {
        return callback({ success: false, error: 'Quiz has ended' });
      }

      // Find or create player
      let playerId = players.find((p) => p.name === playerName)?.playerId;

      if (!playerId) {
        // Add new player
        const newPlayer = await this.addPlayerToRoom(roomCode, playerName);
        playerId = newPlayer.playerId;
      }

      // Join socket to room
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerId = playerId;
      socket.data.playerName = playerName;

      logger.info(`Player ${playerName} joined room ${roomCode}`);

      // Get updated players list
      const updatedPlayers = await PlayerRepository.getPlayers(roomCode);

      // Notify all clients in room
      this.io.to(roomCode).emit('player-joined', {
        playerId,
        playerName,
        players: updatedPlayers,
        playerCount: updatedPlayers.length,
      });

      callback({
        success: true,
        playerId,
        quizId: room.quizId,
        players: updatedPlayers,
      });
    } catch (error) {
      logger.error(`Error joining room: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  async handleLeaveRoom(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, playerId } = data;

    try {
      if (!roomCode || !playerId) {
        return callback({ success: false, error: 'Invalid data' });
      }

      await PlayerRepository.removePlayer(roomCode, playerId);
      socket.leave(roomCode);

      const updatedPlayers = await PlayerRepository.getPlayers(roomCode);

      this.io.to(roomCode).emit('player-left', {
        playerId,
        players: updatedPlayers,
        playerCount: updatedPlayers.length,
      });

      logger.info(`Player ${playerId} left room ${roomCode}`);
      callback({ success: true });
    } catch (error) {
      logger.error(`Error leaving room: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  async handleStartQuiz(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, hostId } = data;

    try {
      const room = await RoomRepository.getRoom(roomCode);

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      if (room.hostId !== hostId) {
        return callback({ success: false, error: 'Only host can start quiz' });
      }

      // Update room status
      await RoomRepository.updateRoom(roomCode, {
        status: 'active',
        startedAt: new Date().toISOString(),
      });

      // Broadcast quiz started
      this.io.to(roomCode).emit('quiz-started', {
        roomCode,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Quiz started in room ${roomCode}`);
      callback({ success: true });
    } catch (error) {
      logger.error(`Error starting quiz: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  async handleSubmitAnswer(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, questionIndex, answerIndex } = data;
    const playerId = socket.data.playerId;

    try {
      if (!roomCode || questionIndex === undefined || answerIndex === undefined) {
        return callback({ success: false, error: 'Invalid data' });
      }

      const room = await RoomRepository.getRoom(roomCode);
      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      const player = await PlayerRepository.getPlayer(roomCode, playerId);
      if (!player) {
        return callback({ success: false, error: 'Player not found' });
      }

      const result = await ScoringService.submitAnswer(
        roomCode,
        questionIndex,
        playerId,
        answerIndex,
        room.quizId
      );

      // Notify room that answer was received
      this.io.to(roomCode).emit('answer-received', {
        playerId,
        playerName: player.name,
        questionIndex,
      });

      logger.info(`Answer submitted by ${playerId} for question ${questionIndex}`);
      const leaderboard = await ScoringService.calculateLeaderboard(roomCode);
      this.io.to(roomCode).emit('leaderboard-update', { leaderboard });

      callback({ success: true, ...result });
    } catch (error) {
      logger.error(`Error submitting answer: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  async handleNextQuestion(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, hostId, questionIndex } = data;

    try {
      const room = await RoomRepository.getRoom(roomCode);

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      if (room.hostId !== hostId) {
        return callback({ success: false, error: 'Only host can advance' });
      }

      // Update current question
      await RoomRepository.updateRoom(roomCode, {
        currentQuestion: questionIndex + 1,
      });

      const AnswerRepository = (await import('../repositories/AnswerRepository.js')).default;
      const answers = await AnswerRepository.getAllAnswers(roomCode, questionIndex);
      const question = await QuizRepository.getQuestion(room.quizId, questionIndex);
      const leaderboard = await ScoringService.calculateLeaderboard(roomCode);

      // Broadcast question results
      this.io.to(roomCode).emit('question-ended', {
        questionIndex,
        correctOption: question?.correctOption,
        answers,
        leaderboard,
      });

      logger.info(`Question ${questionIndex} ended in room ${roomCode}`);
      callback({ success: true });
    } catch (error) {
      logger.error(`Error advancing question: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  async handleEndQuiz(socket, data, callback) {
    callback = typeof callback === 'function' ? callback : () => {};
    const { roomCode, hostId } = data;

    try {
      const room = await RoomRepository.getRoom(roomCode);

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }

      if (room.hostId !== hostId) {
        return callback({ success: false, error: 'Only host can end quiz' });
      }

      // Update room status
      await RoomRepository.updateRoom(roomCode, {
        status: 'completed',
        endedAt: new Date().toISOString(),
      });

      // Get final leaderboard
      const finalLeaderboard = await ScoringService.calculateLeaderboard(roomCode);

      // Broadcast quiz ended
      this.io.to(roomCode).emit('quiz-ended', {
        roomCode,
        leaderboard: finalLeaderboard,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Quiz ended in room ${roomCode}`);

      // Schedule room cleanup after 30 minutes
      setTimeout(async () => {
        try {
          await RoomRepository.deleteRoom(roomCode);
          logger.info(`Room ${roomCode} cleaned up`);
        } catch (error) {
          logger.error(`Error cleaning up room: ${error.message}`);
        }
      }, 30 * 60 * 1000);

      callback({ success: true });
    } catch (error) {
      logger.error(`Error ending quiz: ${error.message}`);
      callback({ success: false, error: error.message });
    }
  }

  handleDisconnect(socket) {
    logger.info(`Client disconnected: ${socket.id}`);
    const { roomCode, playerId } = socket.data;

    if (roomCode && playerId) {
      // Notify room of player leaving
      this.io.to(roomCode).emit('player-left', {
        playerId,
        message: 'Player disconnected',
      });
    }
  }

  async addPlayerToRoom(roomCode, playerName) {
    const { generatePlayerId } = await import('../utils/helpers.js');
    const playerId = generatePlayerId();
    await PlayerRepository.addPlayer(roomCode, playerId, { name: playerName });
    return { playerId, name: playerName };
  }

  broadcastToRoom(roomCode, event, data) {
    this.io.to(roomCode).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  getIO() {
    return this.io;
  }
}

let socketManager;

export const initializeSocket = (httpServer) => {
  socketManager = new SocketManager(httpServer);
  return socketManager;
};

export const getSocketManager = () => {
  if (!socketManager) {
    throw new Error('Socket manager not initialized');
  }
  return socketManager;
};

export default SocketManager;
