import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

export class QuizRepository {
  async createQuiz(quizId, quizData) {
    const client = getRedisClient();
    const key = `quiz:${quizId}`;

    try {
      await client.hSet(key, {
        quizId,
        hostId: quizData.hostId,
        title: quizData.title,
        description: quizData.description || '',
        category: quizData.category || 'General',
        questionCount: quizData.questions.length,
        createdAt: new Date().toISOString(),
      });

      // Store questions
      for (let i = 0; i < quizData.questions.length; i++) {
        const questionKey = `quiz:${quizId}:question:${i}`;
        await client.hSet(questionKey, {
          index: i,
          questionText: quizData.questions[i].questionText,
          options: JSON.stringify(quizData.questions[i].options),
          correctOption: quizData.questions[i].correctOption,
          timeLimit: quizData.questions[i].timeLimit,
        });
      }

      logger.info(`Quiz created: ${quizId}`);
      return { quizId, ...quizData };
    } catch (error) {
      logger.error(`Error creating quiz: ${error.message}`);
      throw error;
    }
  }

  async getQuiz(quizId) {
    const client = getRedisClient();
    const key = `quiz:${quizId}`;

    try {
      const quiz = await client.hGetAll(key);
      if (Object.keys(quiz).length === 0) return null;

      const questionCount = parseInt(quiz.questionCount, 10);
      const questions = [];

      for (let i = 0; i < questionCount; i++) {
        const questionKey = `quiz:${quizId}:question:${i}`;
        const question = await client.hGetAll(questionKey);
        questions.push({
          index: parseInt(question.index, 10),
          questionText: question.questionText,
          options: JSON.parse(question.options),
          correctOption: parseInt(question.correctOption, 10),
          timeLimit: parseInt(question.timeLimit, 10),
        });
      }

      return { ...quiz, questions };
    } catch (error) {
      logger.error(`Error fetching quiz: ${error.message}`);
      throw error;
    }
  }

  async getAllQuizzes() {
    const client = getRedisClient();

    try {
      const keys = await client.keys('quiz:*');
      const quizzes = [];

      for (const key of keys) {
        if (!key.includes(':question:') && !key.includes(':stats')) {
          const quiz = await client.hGetAll(key);
          if (Object.keys(quiz).length > 0) {
            quizzes.push(quiz);
          }
        }
      }

      return quizzes;
    } catch (error) {
      logger.error(`Error fetching all quizzes: ${error.message}`);
      throw error;
    }
  }

  async updateQuiz(quizId, updates) {
    const client = getRedisClient();
    const key = `quiz:${quizId}`;

    try {
      const updateData = {};

      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      if (updates.category !== undefined) {
        updateData.category = updates.category;
      }

      if (Object.keys(updateData).length > 0) {
        await client.hSet(key, updateData);
      }

      if (updates.questions) {
        const oldQuiz = await this.getQuiz(quizId);
        const oldCount = oldQuiz?.questions?.length || 0;

        for (let i = 0; i < oldCount; i++) {
          await client.del(`quiz:${quizId}:question:${i}`);
        }

        await client.hSet(key, { questionCount: updates.questions.length });

        for (let i = 0; i < updates.questions.length; i++) {
          const questionKey = `quiz:${quizId}:question:${i}`;
          await client.hSet(questionKey, {
            index: i,
            questionText: updates.questions[i].questionText,
            options: JSON.stringify(updates.questions[i].options),
            correctOption: updates.questions[i].correctOption,
            timeLimit: updates.questions[i].timeLimit,
          });
        }
      }

      logger.info(`Quiz updated: ${quizId}`);
      return updateData;
    } catch (error) {
      logger.error(`Error updating quiz: ${error.message}`);
      throw error;
    }
  }

  async getQuestion(quizId, questionIndex) {
    const client = getRedisClient();
    const questionKey = `quiz:${quizId}:question:${questionIndex}`;

    try {
      const question = await client.hGetAll(questionKey);
      if (Object.keys(question).length === 0) return null;

      return {
        index: parseInt(question.index, 10),
        questionText: question.questionText,
        options: JSON.parse(question.options),
        correctOption: parseInt(question.correctOption, 10),
        timeLimit: parseInt(question.timeLimit, 10),
      };
    } catch (error) {
      logger.error(`Error fetching question: ${error.message}`);
      throw error;
    }
  }

  async deleteQuiz(quizId) {
    const client = getRedisClient();
    const prefix = `quiz:${quizId}`;

    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(keys);
      }
      logger.info(`Quiz deleted: ${quizId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting quiz: ${error.message}`);
      throw error;
    }
  }

  async getCategories() {
    const client = getRedisClient();

    try {
      const keys = await client.keys('quiz:*');
      const categories = new Set();

      for (const key of keys) {
        if (!key.includes(':question:') && !key.includes(':stats')) {
          const quiz = await client.hGetAll(key);
          if (quiz.category) {
            categories.add(quiz.category);
          }
        }
      }

      return Array.from(categories);
    } catch (error) {
      logger.error(`Error fetching categories: ${error.message}`);
      throw error;
    }
  }
}

export default new QuizRepository();
