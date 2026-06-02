import express from 'express';
import * as QuizController from '../controllers/QuizController.js';
import { validateRequest, createQuizSchema, updateQuizSchema } from '../validators/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// CRUD operations
router.post('/', authenticate, requireRole('host'), validateRequest(createQuizSchema), QuizController.createQuiz);
router.get('/', authenticate, requireRole('host'), QuizController.getAllQuizzes);
router.get('/:quizId/play', QuizController.getPlayableQuiz);
router.get('/:quizId', authenticate, requireRole('host'), QuizController.getQuiz);
router.put('/:quizId', authenticate, requireRole('host'), validateRequest(updateQuizSchema), QuizController.updateQuiz);
router.delete('/:quizId', authenticate, requireRole('host'), QuizController.deleteQuiz);

// Questions
router.get('/:quizId/question/:questionIndex', QuizController.getQuestion);

// Statistics
router.get('/:quizId/statistics', authenticate, requireRole('host'), QuizController.getQuizStatistics);

export default router;
