import express from 'express';
import * as QuizController from '../controllers/QuizController.js';
import { validateRequest, createQuizSchema } from '../validators/index.js';

const router = express.Router();

// CRUD operations
router.post('/', validateRequest(createQuizSchema), QuizController.createQuiz);
router.get('/', QuizController.getAllQuizzes);
router.get('/:quizId', QuizController.getQuiz);
router.put('/:quizId', QuizController.updateQuiz);
router.delete('/:quizId', QuizController.deleteQuiz);

// Questions
router.get('/:quizId/question/:questionIndex', QuizController.getQuestion);

// Statistics
router.get('/:quizId/statistics', QuizController.getQuizStatistics);

export default router;
