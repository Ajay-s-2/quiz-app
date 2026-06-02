import Joi from 'joi';

export const createRoomSchema = Joi.object({
  quizId: Joi.string().required(),
});

export const joinRoomSchema = Joi.object({
  roomCode: Joi.string().length(6).required(),
  playerName: Joi.string().min(2).max(50).required(),
});

export const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  questions: Joi.array()
    .items(
      Joi.object({
        questionText: Joi.string().required(),
        options: Joi.array().items(Joi.string()).min(2).max(4).required(),
        correctOption: Joi.number().min(0).max(3).required(),
        timeLimit: Joi.number().min(5).max(300).required(),
      })
    )
    .min(1)
    .required(),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((e) => e.message);
      return res.status(400).json({
        status: 400,
        message: 'Validation Error',
        errors: messages,
      });
    }

    req.validated = value;
    next();
  };
};

export default {
  createRoomSchema,
  joinRoomSchema,
  createQuizSchema,
  validateRequest,
};
