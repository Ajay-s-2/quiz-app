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
    <div className="page-shell">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{stats.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{stats.category}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/host/dashboard')}
          >
            Dashboard
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Questions */}
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary">{stats.totalQuestions}</div>
            <p className="mt-2 text-sm text-slate-500">Questions</p>
          </Card>

          {/* Total Plays */}
          <Card className="text-center">
            <div className="text-4xl font-bold text-emerald-600">{stats.totalPlays}</div>
            <p className="mt-2 text-sm text-slate-500">Plays</p>
          </Card>

          {/* Average Score */}
          <Card className="text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.averageScore}%</div>
            <p className="mt-2 text-sm text-slate-500">Average Score</p>
          </Card>

          {/* Total Players */}
          <Card className="text-center">
            <div className="text-4xl font-bold text-violet-600">{stats.totalPlayers}</div>
            <p className="mt-2 text-sm text-slate-500">Players</p>
          </Card>
        </div>

        {/* Details Card */}
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-slate-950">Details</h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-1 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold text-slate-700">Quiz ID</span>
              <span className="font-mono text-sm text-slate-600">{quizId}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <span className="font-semibold text-slate-700">Created</span>
              <span className="text-slate-600">
                {stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <span className="font-semibold text-slate-700">Category</span>
              <span className="text-slate-600">{stats.category}</span>
            </div>

            {stats.totalPlays > 0 && (
              <>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="font-semibold text-slate-700">Avg Players</span>
                  <span className="text-slate-600">
                    {(stats.totalPlayers / stats.totalPlays).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="font-semibold text-slate-700">Engagement</span>
                  <span className="font-semibold text-emerald-600">
                    {stats.totalPlays > 0 ? '100%' : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Performance Info */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Performance</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Difficulty:</span> {stats.averageScore > 80 ? 'Easy' : stats.averageScore > 60 ? 'Medium' : 'Hard'}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Status:</span> {stats.totalPlays < 10 ? 'New quiz' : 'Well-played'}
                </p>
              </div>
            </div>
          </Card>

          {/* Usage Info */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Usage</h3>
            <div className="space-y-3">
              {stats.totalPlays === 0 ? (
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Status:</span> Not yet played
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Status:</span> Active
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Questions:</span> {stats.totalQuestions} questions
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            onClick={() => navigate(`/host/quiz/${quizId}/edit`)}
            className="flex-1"
          >
            Edit Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchStatistics()}
            className="flex-1"
          >
            Refresh Stats
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuizStatistics
