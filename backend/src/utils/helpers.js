import { v4 as uuidv4 } from 'uuid';

export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generatePlayerId = () => {
  return uuidv4();
};

export const generateQuizId = () => {
  return uuidv4();
};

export const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

export default {
  generateRoomCode,
  generatePlayerId,
  generateQuizId,
  getCurrentTimestamp,
};
