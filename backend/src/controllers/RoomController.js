import RoomService from '../services/RoomService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const createRoom = asyncHandler(async (req, res) => {
  const { quizId } = req.validated;
  const hostId = req.headers['x-player-id'] || 'anonymous';

  const result = await RoomService.createRoom(quizId, hostId);

  logger.info(`Room created: ${result.roomCode}`);
  res.status(201).json({
    status: 201,
    message: 'Room created successfully',
    data: result,
  });
});

export const getRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;

  const room = await RoomService.getRoom(roomCode);

  res.status(200).json({
    status: 200,
    message: 'Room retrieved successfully',
    data: room,
  });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const { roomCode, playerName } = req.validated;

  const result = await RoomService.joinRoom(roomCode, playerName);

  logger.info(`Player joined room: ${roomCode}`);
  res.status(200).json({
    status: 200,
    message: 'Joined room successfully',
    data: result,
  });
});

export default {
  createRoom,
  getRoom,
  joinRoom,
};
