import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { quizAPI } from '../services/api'
import { Card, Loading } from '../components/Common'
import { CountdownTimer } from '../components/CountdownTimer'
import { ProgressBar } from '../components/ProgressBar'

const QuizPage = () => {
  const { roomCode } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])

  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const { socket, emit, on, off, socketEvents } = useSocket()
  const isHost = user?.isHost

  // Initialize quiz
  useEffect(() => {
    if (!user || !user.quizId) {
      navigate('/')
      return
    }

    loadQuiz()
  }, [user, navigate])

  // Load quiz data
  const loadQuiz = async () => {
    try {
      const response = await quizAPI.getPlayable(user.quizId)
      const playableQuiz = response.data.data

      setQuiz(playableQuiz)
      setCurrentQuestion(playableQuiz.questions[0])
      setTimeLeft(playableQuiz.questions[0].timeLimit)
      setLoading(false)
    } catch (error) {
      addToast('Failed to load quiz', 'error')
      setLoading(false)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || answered || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestion, answered, timeLeft])

  // Socket listeners
  useEffect(() => {
    on(socketEvents.QUESTION_ENDED, (data) => {
      setLeaderboard(data.leaderboard)
      // Show results for 2 seconds then move to next
      setTimeout(() => {
        advanceToNextQuestion()
      }, 2000)
    })

    on(socketEvents.QUIZ_ENDED, (data) => {
      addToast('Quiz ended!', 'success')
      navigate(`/results/${roomCode}`, { state: { leaderboard: data.leaderboard } })
    })

    return () => {
      off(socketEvents.QUESTION_ENDED, null)
      off(socketEvents.QUIZ_ENDED, null)
    }
  }, [on, off, socketEvents, roomCode, navigate, addToast, currentQuestionIndex, quiz, user])

  const handleTimeExpired = () => {
    setAnswered(true)
    addToast('Time expired!', 'warning')

    if (user.isHost) {
      setTimeout(() => {
        endCurrentQuestion()
      }, 1500)
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (isHost) return
    if (answered || timeLeft <= 0) return

    setSelectedAnswer(answerIndex)
    setAnswered(true)

    // Submit answer via socket
    emit(socketEvents.SUBMIT_ANSWER, {
      roomCode,
      questionIndex: currentQuestionIndex,
      answerIndex,
    }, (response) => {
      if (!response?.success) {
        setAnswered(false)
        setSelectedAnswer(null)
        addToast(response?.error || 'Failed to submit answer', 'error')
      }
    })

    addToast('Answer submitted!', 'success')
  }

  const endCurrentQuestion = () => {
    emit(socketEvents.NEXT_QUESTION, {
      roomCode,
      hostId: user.userId || user.playerId,
      questionIndex: currentQuestionIndex,
    }, (response) => {
      if (!response?.success) {
        addToast(response?.error || 'Failed to advance question', 'error')
      }
    })
  }

  const advanceToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= quiz.questions.length) {
      // Quiz ended
      if (user.isHost) {
        emit(socketEvents.END_QUIZ, { roomCode, hostId: user.userId || user.playerId }, (response) => {
          if (!response?.success) {
            addToast(response?.error || 'Failed to end quiz', 'error')
          }
        })
      }
      return
    }

    setCurrentQuestionIndex(nextIndex)
    setCurrentQuestion(quiz.questions[nextIndex])
    setTimeLeft(quiz.questions[nextIndex].timeLimit)
    setSelectedAnswer(null)
    setAnswered(false)
  }

  if (loading) {
    return <Loading />
  }

  if (!quiz || !currentQuestion) {
    return <Loading />
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={quiz.questions.length}
          />
          <p className="mt-2 text-sm font-medium text-slate-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        {/* Timer and Question */}
        <Card className="mb-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold leading-snug text-slate-950">
                {currentQuestion.questionText}
              </h2>
            </div>
            <div className="text-right">
              <CountdownTimer seconds={timeLeft} isActive={!answered} />
            </div>
          </div>

          {isHost && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Host view. Players are answering.</p>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={isHost || answered || timeLeft <= 0}
                className={`min-h-[64px] rounded-xl border p-4 text-left font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2 ${
                  selectedAnswer === idx
                    ? 'border-primary bg-primary text-white shadow-glow'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-primary/50 hover:bg-blue-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {option}
              </button>
            ))}
          </div>

          {!isHost && answered && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Answer submitted.</p>
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{player.rank}</span>
                    <span className="text-slate-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-slate-950">{player.score}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default QuizPage
