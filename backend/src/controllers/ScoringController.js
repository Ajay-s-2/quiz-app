import ScoringService from '../services/ScoringService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;

  const leaderboard = await ScoringService.calculateLeaderboard(roomCode);

  res.status(200).json({
    status: 200,
    message: 'Leaderboard retrieved successfully',
    data: leaderboard,
  });
});

export const getQuestionStats = asyncHandler(async (req, res) => {
  const { roomCode, questionIndex } = req.params;

  const stats = await ScoringService.getQuestionStats(
    roomCode,
    parseInt(questionIndex, 10)
  );

  res.status(200).json({
    status: 200,
    message: 'Question stats retrieved successfully',
    data: stats,
  });
});

export default {
  getLeaderboard,
  getQuestionStats,
};
