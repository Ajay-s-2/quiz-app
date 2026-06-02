import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const socketEvents = {
  // Client -> Server
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  START_QUIZ: 'start-quiz',
  SUBMIT_ANSWER: 'submit-answer',
  NEXT_QUESTION: 'next-question',
  END_QUIZ: 'end-quiz',

  // Server -> Client
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  QUIZ_STARTED: 'quiz-started',
  QUESTION_STARTED: 'question-started',
  TIMER_UPDATE: 'timer-update',
  ANSWER_RECEIVED: 'answer-received',
  QUESTION_ENDED: 'question-ended',
  LEADERBOARD_UPDATE: 'leaderboard-update',
  QUIZ_ENDED: 'quiz-ended',
}

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  socketEvents,
}
