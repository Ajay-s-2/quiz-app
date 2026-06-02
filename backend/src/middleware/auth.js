import AuthService from '../services/AuthService.js';
import AppError from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getUserByToken(token);
    if (!user) {
      throw new AppError('Invalid or expired session', 401);
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }
    next();
  };
};
