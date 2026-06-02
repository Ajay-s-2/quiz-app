import QuizService from '../services/QuizService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const createQuiz = asyncHandler(async (req, res) => {
  const quizData = req.validated;

  const result = await QuizService.createQuiz(quizData);

  logger.info(`Quiz created: ${result.quizId}`);
  res.status(201).json({
    status: 201,
    message: 'Quiz created successfully',
    data: result,
  });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await QuizService.getQuiz(quizId);

  res.status(200).json({
    status: 200,
    message: 'Quiz retrieved successfully',
    data: quiz,
  });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const { quizId, questionIndex } = req.params;

  const question = await QuizService.getQuestion(quizId, parseInt(questionIndex, 10));

  res.status(200).json({
    status: 200,
    message: 'Question retrieved successfully',
    data: question,
  });
});

export const getAllQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', category = '' } = req.query;

  const quizzes = await QuizService.getAllQuizzes({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
  });

  res.status(200).json({
    status: 200,
    message: 'Quizzes retrieved successfully',
    data: quizzes,
  });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const updates = req.validated;

  const quiz = await QuizService.updateQuiz(quizId, updates);

  logger.info(`Quiz updated: ${quizId}`);
  res.status(200).json({
    status: 200,
    message: 'Quiz updated successfully',
    data: quiz,
  });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  await QuizService.deleteQuiz(quizId);

  logger.info(`Quiz deleted: ${quizId}`);
  res.status(200).json({
    status: 200,
    message: 'Quiz deleted successfully',
  });
});

export const getQuizStatistics = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const stats = await QuizService.getStatistics(quizId);

  res.status(200).json({
    status: 200,
    message: 'Quiz statistics retrieved successfully',
    data: stats,
  });
});

export default {
  createQuiz,
  getQuiz,
  getQuestion,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  getQuizStatistics,
};
