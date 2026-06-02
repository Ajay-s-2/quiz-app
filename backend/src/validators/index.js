import Joi from 'joi';

export const createRoomSchema = Joi.object({
  quizId: Joi.string().required(),
});

export const joinRoomSchema = Joi.object({
  roomCode: Joi.string().length(6).required(),
  playerName: Joi.string().min(2).max(50).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const createHostSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const updateHostSchema = Joi.object({
  name: Joi.string().min(2).max(80),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(128),
  status: Joi.string().valid('active', 'inactive'),
}).min(1);

export const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  category: Joi.string().max(100).default('General'),
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

export const updateQuizSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().max(500).allow(''),
  category: Joi.string().max(100),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()).min(2).max(4).required(),
      correctOption: Joi.number().min(0).max(3).required(),
      timeLimit: Joi.number().min(5).max(300).required(),
    })
  ),
}).min(1);

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
  loginSchema,
  createHostSchema,
  updateHostSchema,
  createQuizSchema,
  updateQuizSchema,
  validateRequest,
};
