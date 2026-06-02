import PlayerRepository from '../repositories/PlayerRepository.js';
import AnswerRepository from '../repositories/AnswerRepository.js';
import QuizService from './QuizService.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

export class ScoringService {
  async submitAnswer(roomCode, questionIndex, playerId, answerIndex, quizId) {
    try {
      // Check if player already answered
      const hasAnswered = await AnswerRepository.hasPlayerAnswered(
        roomCode,
        questionIndex,
        playerId
      );

      if (hasAnswered) {
        throw new AppError('Answer already submitted for this question', 400);
      }

      // Validate answer
      const { isCorrect } = await QuizService.validateAnswer(
        quizId,
        questionIndex,
        answerIndex
      );

      // Store answer
      await AnswerRepository.submitAnswer(roomCode, questionIndex, playerId, answerIndex);

      // Calculate points
      const points = isCorrect ? 10 : 0;

      // Update player score
      const player = await PlayerRepository.getPlayer(roomCode, playerId);
      if (!player) {
        throw new AppError('Player not found', 404);
      }
      const currentScore = parseInt(player.score, 10) || 0;
      const newScore = currentScore + points;

      await PlayerRepository.updatePlayerScore(roomCode, playerId, newScore);

      logger.info(
        `Answer scored: Room ${roomCode}, Player ${playerId}, Points ${points}`
      );

      return {
        isCorrect,
        pointsEarned: points,
        totalScore: newScore,
      };
    } catch (error) {
      logger.error(`Error submitting answer: ${error.message}`);
      throw error;
    }
  }

  async calculateLeaderboard(roomCode) {
    try {
      const players = await PlayerRepository.getPlayers(roomCode);

      const leaderboard = players
        .map((player) => ({
          playerId: player.playerId,
          name: player.name,
          score: parseInt(player.score, 10) || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          rank: index + 1,
          ...player,
        }));

      logger.info(`Leaderboard calculated for room ${roomCode}`);
      return leaderboard;
    } catch (error) {
      logger.error(`Error calculating leaderboard: ${error.message}`);
      throw error;
    }
  }

  async getQuestionStats(roomCode, questionIndex) {
    try {
      const answers = await AnswerRepository.getAllAnswers(roomCode, questionIndex);
      const players = await PlayerRepository.getPlayers(roomCode);

      const stats = {
        totalResponses: Object.keys(answers).length,
        totalPlayers: players.length,
        responsePercentage:
          players.length > 0
            ? Math.round((Object.keys(answers).length / players.length) * 100)
            : 0,
        answerDistribution: {},
      };

      for (const [, answer] of Object.entries(answers)) {
        const answerIndex = parseInt(answer, 10);
        stats.answerDistribution[answerIndex] =
          (stats.answerDistribution[answerIndex] || 0) + 1;
      }

      return stats;
    } catch (error) {
      logger.error(`Error getting question stats: ${error.message}`);
      throw error;
    }
  }
}

export default new ScoringService();
