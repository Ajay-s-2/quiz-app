import express from 'express';
import * as SeedController from '../controllers/SeedController.js';

const router = express.Router();

router.post('/quizzes', SeedController.seedQuizzes);

export default router;