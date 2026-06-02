import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { quizAPI } from '../services/api'
import { Card, Button, Loading } from '../components/Common'

const QuizStatistics = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStatistics, 10000)
    return () => clearInterval(interval)
  }, [quizId])

  const fetchStatistics = async () => {
    try {
      const response = await quizAPI.getStatistics(quizId)
      if (response.data.data) {
        setStats(response.data.data)
      }
    } catch (error) {
      addToast('Failed to load statistics', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!stats) return <Card>No statistics available</Card>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">{stats.title}</h1>
            <p className="text-indigo-100 mt-2">Category: {stats.category}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/host/dashboard')}
            className="text-white border-white hover:bg-white hover:text-indigo-600"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Questions */}
          <Card className="bg-white text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-indigo-600">{stats.totalQuestions}</div>
              <p className="text-gray-600 mt-2">Total Questions</p>
            </div>
          </Card>

          {/* Total Plays */}
          <Card className="bg-white text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-green-600">{stats.totalPlays}</div>
              <p className="text-gray-600 mt-2">Total Plays</p>
            </div>
          </Card>

          {/* Average Score */}
          <Card className="bg-white text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-blue-600">{stats.averageScore}%</div>
              <p className="text-gray-600 mt-2">Average Score</p>
            </div>
          </Card>

          {/* Total Players */}
          <Card className="bg-white text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-purple-600">{stats.totalPlayers}</div>
              <p className="text-gray-600 mt-2">Total Players</p>
            </div>
          </Card>
        </div>

        {/* Details Card */}
        <Card className="bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Quiz ID:</span>
              <span className="text-gray-600 font-mono">{quizId}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Created:</span>
              <span className="text-gray-600">
                {stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Category:</span>
              <span className="text-gray-600">{stats.category}</span>
            </div>

            {stats.totalPlays > 0 && (
              <>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold">Avg Players per Game:</span>
                  <span className="text-gray-600">
                    {(stats.totalPlayers / stats.totalPlays).toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-semibold">Engagement Rate:</span>
                  <span className="text-green-600 font-semibold">
                    {stats.totalPlays > 0 ? '100%' : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Performance Info */}
          <Card className="bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Difficulty:</span> {stats.averageScore > 80 ? 'Easy' : stats.averageScore > 60 ? 'Medium' : 'Hard'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Recommendation:</span> {stats.totalPlays < 10 ? 'New quiz' : 'Well-played quiz'}
                </p>
              </div>
            </div>
          </Card>

          {/* Usage Info */}
          <Card className="bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Usage</h3>
            <div className="space-y-3">
              {stats.totalPlays === 0 ? (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Status:</span> Not yet played
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Status:</span> Active & Popular
                  </p>
                </div>
              )}
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Questions:</span> {stats.totalQuestions} questions
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="primary"
            onClick={() => navigate(`/host/quiz/${quizId}/edit`)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchStatistics()}
            className="flex-1 text-white border-white hover:bg-white hover:text-indigo-600"
          >
            Refresh Stats
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuizStatistics
