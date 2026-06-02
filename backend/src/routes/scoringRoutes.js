import express from 'express';
import * as ScoringController from '../controllers/ScoringController.js';

const router = express.Router();

router.get('/:roomCode/leaderboard', ScoringController.getLeaderboard);
router.get('/:roomCode/question/:questionIndex/stats', ScoringController.getQuestionStats);

export default router;
