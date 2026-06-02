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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Host Dashboard</h1>
            <p className="text-indigo-100 mt-2">{user?.name}</p>
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
            <Button variant="outline" className="text-white border-white" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage(1)
              }}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All Categories</option>
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
            <Card className="text-center py-8">
              <p className="text-gray-600">No quizzes found.</p>
            </Card>
          ) : (
            quizzes.map((quiz) => (
              <Card key={quiz.quizId} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                    <p className="text-gray-600">{quiz.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Category: <span className="font-semibold">{quiz.category}</span>
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold self-start">
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
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-white border-white hover:bg-white hover:text-indigo-600"
            >
              Previous
            </Button>
            <span className="text-white py-2">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              className="text-white border-white hover:bg-white hover:text-indigo-600"
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
