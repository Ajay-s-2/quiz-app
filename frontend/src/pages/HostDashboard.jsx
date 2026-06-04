import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { quizAPI } from '../services/api'
import { Card, Button, Input, Loading } from '../components/Common'

const HostDashboard = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    fetchQuizzes()
  }, [page, searchTerm, categoryFilter])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await quizAPI.getAll({
        page,
        limit: 10,
        search: searchTerm,
        category: categoryFilter,
      })

      setQuizzes(response.data.data?.quizzes || [])
    } catch (error) {
      addToast('Failed to load quizzes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return

    try {
      await quizAPI.delete(quizId)
      addToast('Quiz deleted successfully', 'success')
      fetchQuizzes()
    } catch (error) {
      addToast('Failed to delete quiz', 'error')
    }
  }

  if (loading && quizzes.length === 0) return <Loading />

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl">
        <div className="page-header">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Quizzes</h1>
            <p className="mt-1 text-sm text-slate-500">{user?.name}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/host/quiz/create')}
              className="px-6 py-3"
            >
              Create Quiz
            </Button>
            <Button variant="secondary" onClick={() => navigate('/host')}>
              Host Live Room
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="text"
              placeholder="Search quizzes"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage(1)
              }}
            />
            <select
              className="select-field"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All categories</option>
              <option value="General">General Knowledge</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {quizzes.length === 0 ? (
            <Card className="py-10 text-center">
              <p className="text-sm text-slate-500">No quizzes found.</p>
            </Card>
          ) : (
            quizzes.map((quiz) => (
              <Card key={quiz.quizId} className="transition hover:border-slate-300 hover:shadow-lg">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                    )}
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{quiz.category}</span>
                    </p>
                  </div>
                  <span className="status-pill self-start bg-blue-50 text-blue-700">
                    {quiz.questionCount || 0} Questions
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/host', { state: { quizId: quiz.quizId } })}
                    className="text-sm"
                  >
                    Host
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/host/quiz/${quiz.quizId}/stats`)}
                    className="text-sm"
                  >
                    Statistics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/host/quiz/${quiz.quizId}/edit`)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteQuiz(quiz.quizId)}
                    className="text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {quizzes.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="py-2 text-sm font-medium text-slate-600">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostDashboard
