import express from 'express';
import roomRoutes from './roomRoutes.js';
import quizRoutes from './quizRoutes.js';
import scoringRoutes from './scoringRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/quizzes', quizRoutes);
router.use('/scoring', scoringRoutes);

export default router;
