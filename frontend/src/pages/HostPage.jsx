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

        // Join socket room as host without creating a player entry
        emit(socketEvents.JOIN_ROOM, {
          roomCode: code,
          playerName: user.name,
          isHost: true,
          hostId: user.userId,
        }, (response) => {
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
    if (players.length < 1) {
      addToast('Wait for players to join before starting', 'info')
      return
    }

    emit(socketEvents.START_QUIZ, { roomCode, hostId: user.userId || user.playerId }, (response) => {
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
      <div className="page-shell flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-950">Select Quiz</h1>
            <p className="mt-1 text-sm text-slate-500">Choose a quiz to host.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedQuiz?.quizId === quiz.quizId
                    ? 'border-primary bg-blue-50 ring-2 ring-primary/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                    )}
                  </div>
                  <span className="status-pill self-start bg-slate-100 text-slate-700">
                    {quiz.questionCount} questions
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            className="mt-6 w-full"
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
      <div className="page-shell flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <h1 className="mb-6 text-center text-2xl font-semibold text-slate-950">Quiz Lobby</h1>

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Room Code</h2>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={roomCode}
                readOnly
                className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-4 py-3 text-center font-mono text-2xl font-bold text-slate-950"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomCode)
                  addToast('Room code copied!', 'success')
                }}
                className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Players ({players.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">Waiting for players...</p>
              ) : (
                players.map((player, idx) => (
                  <div
                    key={player.playerId || idx}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-slate-800">{player.name}</span>
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
