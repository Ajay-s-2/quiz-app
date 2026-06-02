import express from 'express';
import roomRoutes from './roomRoutes.js';
import quizRoutes from './quizRoutes.js';
import scoringRoutes from './scoringRoutes.js';
import seedRoutes from './seedRoutes.js';

const router = express.Router();

router.use('/rooms', roomRoutes);
router.use('/quizzes', quizRoutes);
router.use('/scoring', scoringRoutes);
router.use('/seed', seedRoutes);

export default router;
