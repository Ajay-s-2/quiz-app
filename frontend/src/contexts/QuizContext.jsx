import React, { createContext, useContext, useState } from 'react'

const QuizContext = createContext()

export const QuizProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [players, setPlayers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [isHost, setIsHost] = useState(false)

  const updateRoom = (room) => {
    setCurrentRoom(room)
  }

  const updateQuiz = (quiz) => {
    setCurrentQuiz(quiz)
  }

  const updatePlayers = (playersList) => {
    setPlayers(playersList)
  }

  const updateQuestion = (question) => {
    setCurrentQuestion(question)
  }

  const updateLeaderboard = (newLeaderboard) => {
    setLeaderboard(newLeaderboard)
  }

  const resetQuizState = () => {
    setCurrentRoom(null)
    setCurrentQuiz(null)
    setPlayers([])
    setCurrentQuestion(null)
    setLeaderboard([])
    setIsHost(false)
  }

  return (
    <QuizContext.Provider
      value={{
        currentRoom,
        currentQuiz,
        players,
        currentQuestion,
        leaderboard,
        isHost,
        updateRoom,
        updateQuiz,
        updatePlayers,
        updateQuestion,
        updateLeaderboard,
        setIsHost,
        resetQuizState,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider')
  }
  return context
}
