import SeedService from '../services/SeedService.js';
import { asyncHandler } from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const seedQuizzes = asyncHandler(async (req, res) => {
  const result = await SeedService.seedQuizzes();

  logger.info('Quiz seeding completed');
  res.status(200).json({
    status: 200,
    message: result.message,
    data: result,
  });
});

export default {
  seedQuizzes,
};