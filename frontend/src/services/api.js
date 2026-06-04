import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error.response?.data
  const message = data?.errors?.[0] || data?.message || fallback
  return message.replaceAll('"', '')
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getHosts: () => api.get('/auth/hosts'),
  createHost: (hostData) => api.post('/auth/hosts', hostData),
  updateHost: (userId, updates) => api.put(`/auth/hosts/${userId}`, updates),
  deleteHost: (userId) => api.delete(`/auth/hosts/${userId}`),
}

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
  getPlayable: (quizId) => api.get(`/quizzes/${quizId}/play`),
  getAll: (params) => api.get('/quizzes', { params }),
  update: (quizId, updates) => api.put(`/quizzes/${quizId}`, updates),
  delete: (quizId) => api.delete(`/quizzes/${quizId}`),
  getQuestion: (quizId, questionIndex) =>
    api.get(`/quizzes/${quizId}/question/${questionIndex}`),
  getStatistics: (quizId) => api.get(`/quizzes/${quizId}/statistics`),
}

// Scoring API
export const scoringAPI = {
  getLeaderboard: (roomCode) => api.get(`/scoring/${roomCode}/leaderboard`),
  getQuestionStats: (roomCode, questionIndex) =>
    api.get(`/scoring/${roomCode}/question/${questionIndex}/stats`),
}

export default api
