import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { roomAPI, quizAPI } from '../services/api'
import { Button, Card, Loading } from '../components/Common'

const HostPage = () => {
  const [step, setStep] = useState('select') // select, create, lobby
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUserData } = useAuth()
  const { addToast } = useToast()
  const { socket, emit, on, off, socketEvents } = useSocket()

  // Fetch available quizzes
  useEffect(() => {
    if (step === 'select') {
      fetchQuizzes()
    }
  }, [step])

  // Listen for player joins
  useEffect(() => {
    if (roomCode) {
      on(socketEvents.PLAYER_JOINED, (data) => {
        setPlayers(data.players)
        addToast(`${data.playerName} joined!`, 'success')
      })

      on(socketEvents.PLAYER_LEFT, (data) => {
        setPlayers(data.players)
        addToast('A player left the room', 'info')
      })
    }

    return () => {
      off(socketEvents.PLAYER_JOINED, null)
      off(socketEvents.PLAYER_LEFT, null)
    }
  }, [roomCode, on, off, socketEvents, addToast])

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAll({ limit: 50 })
      const loadedQuizzes = response.data.data?.quizzes || []
      setQuizzes(loadedQuizzes)

      if (location.state?.quizId) {
        const preselectedQuiz = loadedQuizzes.find((quiz) => quiz.quizId === location.state.quizId)
        if (preselectedQuiz) {
          setSelectedQuiz(preselectedQuiz)
        }
      }
    } catch (error) {
      addToast('Failed to load quizzes', 'error')
    }
  }

  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      addToast('Please select a quiz', 'error')
      return
    }

    setLoading(true)
    setConnecting(true)

    try {
      const quizId = selectedQuiz.quizId
      const response = await roomAPI.create(quizId)

      if (response.data.data) {
        const code = response.data.data.roomCode

        setRoomCode(code)

        // Store host info
        setUserData({
          ...user,
          playerId: user.userId,
          playerName: user.name,
          roomCode: code,
          isHost: true,
          quizId,
        })

        // Join room via socket
        emit(socketEvents.JOIN_ROOM, { roomCode: code, playerName: user.name }, (response) => {
          setLoading(false)

          if (!response || !response.success) {
            addToast('Failed to create room', 'error')
            setConnecting(false)
            return
          }

          setPlayers(response.players || [])
          setStep('lobby')
          addToast('Room created! Share the code with players.', 'success')
        })
      }
    } catch (error) {
      setLoading(false)
      setConnecting(false)
      addToast('Failed to create room', 'error')
    }
  }

  const handleStartQuiz = () => {
    if (players.length <= 1) {
      addToast('Wait for players to join before starting', 'info')
      return
    }

    emit(socketEvents.START_QUIZ, { roomCode, hostId: user.playerId }, (response) => {
      if (response.success) {
        addToast('Quiz started!', 'success')
        navigate(`/quiz/${roomCode}`)
      } else {
        addToast(response.error || 'Failed to start quiz', 'error')
      }
    })
  }

  if (connecting && loading) {
    return <Loading />
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Select Quiz</h1>

          <div className="grid grid-cols-1 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedQuiz?.quizId === quiz.quizId
                    ? 'border-primary bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <h3 className="font-bold text-lg text-gray-800">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
                <p className="text-sm text-gray-500 mt-2">{quiz.questionCount} questions</p>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            className="w-full mt-6 !bg-blue-500 !text-white hover:!bg-blue-600"
            disabled={!selectedQuiz || loading}
            onClick={handleCreateRoom}
          >
            {loading ? 'Creating Room...' : 'Create Quiz'}
          </Button>
        </Card>
      </div>
    )
  }

  if (step === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Quiz Lobby</h1>

          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Code</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={roomCode}
                readOnly
                className="flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-indigo-400 rounded-lg bg-white"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode)
                  addToast('Room code copied!', 'success')
                }}
                className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Players ({players.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-gray-600 text-center py-4">Waiting for players...</p>
              ) : (
                players.map((player, idx) => (
                  <div
                    key={player.playerId || idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-gray-800">{player.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={players.length === 0 || loading}
            onClick={handleStartQuiz}
          >
            {loading ? 'Starting...' : 'Start Quiz'}
          </Button>
        </Card>
      </div>
    )
  }

  return null
}

export default HostPage
