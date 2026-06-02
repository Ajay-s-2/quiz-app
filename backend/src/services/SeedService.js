import QuizRepository from '../repositories/QuizRepository.js';
import { generateQuizId } from '../utils/helpers.js';
import logger from '../config/logger.js';

export class SeedService {
  async seedQuizzes() {
    try {
      const seedData = [
        {
          title: 'General Knowledge Quiz',
          description: 'Test your general knowledge with diverse questions',
          category: 'General',
          questions: [
            {
              questionText: 'What is the capital of France?',
              options: ['London', 'Paris', 'Berlin', 'Madrid'],
              correctOption: 1,
              timeLimit: 10,
            },
            {
              questionText: 'Which planet is known as the Red Planet?',
              options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
              correctOption: 1,
              timeLimit: 10,
            },
            {
              questionText: 'Who wrote Romeo and Juliet?',
              options: ['Mark Twain', 'William Shakespeare', 'Jane Austen', 'Charles Dickens'],
              correctOption: 1,
              timeLimit: 15,
            },
            {
              questionText: 'What is the largest ocean on Earth?',
              options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
              correctOption: 3,
              timeLimit: 10,
            },
          ],
        },
        {
          title: 'Science Quiz',
          description: 'Challenge yourself with science questions',
          category: 'Science',
          questions: [
            {
              questionText: 'What is the chemical symbol for Gold?',
              options: ['Go', 'Gd', 'Au', 'Ag'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'How many bones are in the human body?',
              options: ['186', '206', '226', '246'],
              correctOption: 1,
              timeLimit: 10,
            },
            {
              questionText: 'What is the speed of light?',
              options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
              correctOption: 0,
              timeLimit: 15,
            },
            {
              questionText: 'What gas do plants absorb from the atmosphere?',
              options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
              correctOption: 2,
              timeLimit: 10,
            },
          ],
        },
        {
          title: 'History Quiz',
          description: 'Test your knowledge of world history',
          category: 'History',
          questions: [
            {
              questionText: 'In what year did World War II end?',
              options: ['1943', '1944', '1945', '1946'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'Who was the first President of the United States?',
              options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
              correctOption: 1,
              timeLimit: 12,
            },
            {
              questionText: 'Which empire built the Great Wall of China?',
              options: ['Han Dynasty', 'Ming Dynasty', 'Song Dynasty', 'Zhou Dynasty'],
              correctOption: 1,
              timeLimit: 10,
            },
            {
              questionText: 'What year did the Titanic sink?',
              options: ['1910', '1911', '1912', '1913'],
              correctOption: 2,
              timeLimit: 10,
            },
          ],
        },
        {
          title: 'Geography Quiz',
          description: 'Test your geography skills',
          category: 'Geography',
          questions: [
            {
              questionText: 'Which is the smallest country in the world?',
              options: ['Monaco', 'Liechtenstein', 'Vatican City', 'San Marino'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'What is the capital of Japan?',
              options: ['Osaka', 'Kyoto', 'Tokyo', 'Yokohama'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'Which continent is the largest by area?',
              options: ['Africa', 'North America', 'Asia', 'South America'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'What is the longest river in the world?',
              options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
              correctOption: 1,
              timeLimit: 10,
            },
          ],
        },
        {
          title: 'Technology Quiz',
          description: 'Test your technology knowledge',
          category: 'Technology',
          questions: [
            {
              questionText: 'Who invented the World Wide Web?',
              options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Linus Torvalds'],
              correctOption: 2,
              timeLimit: 12,
            },
            {
              questionText: 'What does HTML stand for?',
              options: [
                'Hyper Text Markup Language',
                'High Tech Modern Language',
                'Home Tool Markup Language',
                'Hyperlinks and Text Markup Language',
              ],
              correctOption: 0,
              timeLimit: 10,
            },
            {
              questionText: 'In what year was the first iPhone released?',
              options: ['2005', '2006', '2007', '2008'],
              correctOption: 2,
              timeLimit: 10,
            },
            {
              questionText: 'Which programming language is known for AI and data science?',
              options: ['Java', 'Python', 'C++', 'JavaScript'],
              correctOption: 1,
              timeLimit: 10,
            },
          ],
        },
      ];

      let created = 0;

      for (const quizData of seedData) {
        const quizId = generateQuizId();
        await QuizRepository.createQuiz(quizId, quizData);
        created++;
        logger.info(`Seeded quiz: ${quizData.title} (${quizId})`);
      }

      logger.info(`Successfully seeded ${created} quizzes`);
      return {
        success: true,
        created,
        message: `Seeded ${created} quizzes successfully`,
      };
    } catch (error) {
      logger.error(`Error seeding quizzes: ${error.message}`);
      throw error;
    }
  }

  async seedSpecificQuiz(quizData) {
    try {
      const quizId = generateQuizId();
      await QuizRepository.createQuiz(quizId, quizData);
      logger.info(`Seeded custom quiz: ${quizData.title} (${quizId})`);
      return { success: true, quizId };
    } catch (error) {
      logger.error(`Error seeding custom quiz: ${error.message}`);
      throw error;
    }
  }
}

export default new SeedService();