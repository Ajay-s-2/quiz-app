import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Room API
export const roomAPI = {
  create: (quizId) => api.post('/rooms/create', { quizId }),
  get: (roomCode) => api.get(`/rooms/${roomCode}`),
  join: (roomCode, playerName) =>
    api.post('/rooms/join', { roomCode, playerName }),
}

// Quiz API
export const quizAPI = {
  create: (quizData) => api.post('/quizzes', quizData),
  get: (quizId) => api.get(`/quizzes/${quizId}`),
  getAll: (params) => api.get('/quizzes', { params }),
  update: (quizId, updates) => api.put(`/quizzes/${quizId}`, updates),
  delete: (quizId) => api.delete(`/quizzes/${quizId}`),
  getQuestion: (quizId, questionIndex) =>
    api.get(`/quizzes/${quizId}/question/${questionIndex}`),
  getStatistics: (quizId) => api.get(`/quizzes/${quizId}/statistics`),
  seed: () => api.post('/seed/quizzes'),
}

// Scoring API
export const scoringAPI = {
  getLeaderboard: (roomCode) => api.get(`/scoring/${roomCode}/leaderboard`),
  getQuestionStats: (roomCode, questionIndex) =>
    api.get(`/scoring/${roomCode}/question/${questionIndex}/stats`),
}

export default api
