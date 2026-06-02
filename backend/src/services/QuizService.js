import QuizRepository from '../repositories/QuizRepository.js';
import AppError from '../utils/AppError.js';
import { generateQuizId } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { getRedisClient } from '../config/redis.js';

export class QuizService {
  assertQuizAccess(quiz, hostId) {
    if (!hostId || quiz.hostId !== hostId) {
      throw new AppError('Quiz not found', 404);
    }
  }

  async createQuiz(quizData, hostId) {
    try {
      const quizId = generateQuizId();
      const ownedQuizData = { ...quizData, hostId };

      await QuizRepository.createQuiz(quizId, ownedQuizData);

      logger.info(`Quiz created with ID ${quizId}`);
      return { quizId, ...ownedQuizData };
    } catch (error) {
      logger.error(`Error creating quiz: ${error.message}`);
      throw error;
    }
  }

  async getQuiz(quizId, hostId = null) {
    try {
      const quiz = await QuizRepository.getQuiz(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      if (hostId) {
        this.assertQuizAccess(quiz, hostId);
      }

      return quiz;
    } catch (error) {
      logger.error(`Error fetching quiz: ${error.message}`);
      throw error;
    }
  }

  async getAllQuizzes(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', category = '', hostId } = options;
      const client = getRedisClient();

      // Get all quiz keys
      const keys = await client.keys('quiz:*');
      const quizMetaKeys = keys.filter(
        (k) => !k.includes(':question:') && !k.includes(':stats')
      );

      let quizzes = [];
      for (const key of quizMetaKeys) {
        const quiz = await client.hGetAll(key);
        if (Object.keys(quiz).length > 0) {
          quizzes.push(quiz);
        }
      }

      if (hostId) {
        quizzes = quizzes.filter((q) => q.hostId === hostId);
      }

      // Filter by search
      if (search) {
        quizzes = quizzes.filter(
          (q) =>
            q.title?.toLowerCase().includes(search.toLowerCase()) ||
            q.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by category
      if (category) {
        quizzes = quizzes.filter((q) => q.category === category);
      }

      // Pagination
      const total = quizzes.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedQuizzes = quizzes.slice(start, end);

      logger.info(`Retrieved ${paginatedQuizzes.length} quizzes`);

      return {
        quizzes: paginatedQuizzes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Error fetching quizzes: ${error.message}`);
      throw error;
    }
  }

  async getQuestion(quizId, questionIndex) {
    try {
      const quiz = await QuizRepository.getQuiz(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
        throw new AppError('Question not found', 404);
      }

      const question = quiz.questions[questionIndex];
      // Don't send correct answer to client
      const { correctOption, ...questionWithoutAnswer } = question;

      return questionWithoutAnswer;
    } catch (error) {
      logger.error(`Error fetching question: ${error.message}`);
      throw error;
    }
  }

  async updateQuiz(quizId, updates, hostId) {
    try {
      const quiz = await QuizRepository.getQuiz(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }
      this.assertQuizAccess(quiz, hostId);

      await QuizRepository.updateQuiz(quizId, updates);

      logger.info(`Quiz ${quizId} updated`);
      return await QuizRepository.getQuiz(quizId);
    } catch (error) {
      logger.error(`Error updating quiz: ${error.message}`);
      throw error;
    }
  }

  async deleteQuiz(quizId, hostId) {
    try {
      const quiz = await QuizRepository.getQuiz(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }
      this.assertQuizAccess(quiz, hostId);

      await QuizRepository.deleteQuiz(quizId);
      logger.info(`Quiz ${quizId} deleted`);
      return true;
    } catch (error) {
      logger.error(`Error deleting quiz: ${error.message}`);
      throw error;
    }
  }

  async validateAnswer(quizId, questionIndex, answerIndex) {
    try {
      const question = await QuizRepository.getQuestion(quizId, questionIndex);
      if (!question) {
        throw new AppError('Question not found', 404);
      }

      const isCorrect = question.correctOption === answerIndex;
      return { isCorrect, correctOption: question.correctOption };
    } catch (error) {
      logger.error(`Error validating answer: ${error.message}`);
      throw error;
    }
  }

  async getStatistics(quizId, hostId) {
    try {
      const quiz = await QuizRepository.getQuiz(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }
      this.assertQuizAccess(quiz, hostId);

      const client = getRedisClient();

      // Get stats from Redis
      const statsKey = `quiz:${quizId}:stats`;
      const stats = await client.hGetAll(statsKey);

      const response = {
        quizId,
        title: quiz.title,
        totalQuestions: quiz.questions?.length || 0,
        totalPlays: parseInt(stats.totalPlays || 0, 10),
        averageScore: parseFloat(stats.averageScore || 0).toFixed(2),
        totalPlayers: parseInt(stats.totalPlayers || 0, 10),
        createdAt: quiz.createdAt,
        category: quiz.category || 'General',
      };

      logger.info(`Retrieved statistics for quiz ${quizId}`);
      return response;
    } catch (error) {
      logger.error(`Error fetching statistics: ${error.message}`);
      throw error;
    }
  }
}

export default new QuizService();
