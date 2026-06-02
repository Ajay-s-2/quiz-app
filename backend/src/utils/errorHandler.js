import logger from '../config/logger.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  const response = {
    status: err.statusCode,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  logger.error(`Error: ${err.message}`, {
    statusCode: err.statusCode,
    stack: err.stack,
  });

  res.status(err.statusCode).json(response);
};

export default { asyncHandler, globalErrorHandler };
