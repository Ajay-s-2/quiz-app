import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { quizAPI } from '../services/api'
import { Card, Loading, Button } from '../components/Common'
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
      // Mock quiz data - in production fetch from API
      const mockQuiz = {
        title: 'General Knowledge Quiz',
        questions: [
          {
            index: 0,
            questionText: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            timeLimit: 10,
          },
          {
            index: 1,
            questionText: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            timeLimit: 10,
          },
          {
            index: 2,
            questionText: 'Who wrote Romeo and Juliet?',
            options: ['Mark Twain', 'William Shakespeare', 'Jane Austen', 'Charles Dickens'],
            timeLimit: 15,
          },
        ],
      }

      setQuiz(mockQuiz)
      setCurrentQuestion(mockQuiz.questions[0])
      setTimeLeft(mockQuiz.questions[0].timeLimit)
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
        moveToNextQuestion()
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
  }, [on, off, socketEvents, roomCode, navigate, addToast])

  const handleTimeExpired = () => {
    setAnswered(true)
    addToast('Time expired!', 'warning')

    if (user.isHost) {
      setTimeout(() => {
        moveToNextQuestion()
      }, 1500)
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (answered || timeLeft <= 0) return

    setSelectedAnswer(answerIndex)
    setAnswered(true)

    // Submit answer via socket
    emit(socketEvents.SUBMIT_ANSWER, {
      roomCode,
      questionIndex: currentQuestionIndex,
      answerIndex,
    })

    addToast('Answer submitted!', 'success')
  }

  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= quiz.questions.length) {
      // Quiz ended
      if (user.isHost) {
        emit(socketEvents.END_QUIZ, { roomCode, hostId: user.playerId })
      }
      return
    }

    // Notify server to move to next question
    if (user.isHost) {
      emit(socketEvents.NEXT_QUESTION, {
        roomCode,
        hostId: user.playerId,
        questionIndex: currentQuestionIndex,
        correctOption: 0, // Get from quiz
      })
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={quiz.questions.length}
          />
          <p className="text-white text-sm mt-2">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        {/* Timer and Question */}
        <Card className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion.questionText}
              </h2>
            </div>
            <div className="text-right">
              <CountdownTimer seconds={timeLeft} isActive={!answered} />
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={answered || timeLeft <= 0}
                className={`p-4 rounded-lg font-semibold text-left transition-all ${
                  selectedAnswer === idx
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {option}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Answer submitted! Waiting for next question...
              </p>
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{player.rank}</span>
                    <span className="text-gray-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{player.score}</span>
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
