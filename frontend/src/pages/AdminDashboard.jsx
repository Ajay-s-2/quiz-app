import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { quizAPI } from '../services/api'
import { Card, Button, Input, Loading } from '../components/Common'

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
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

      if (response.data.data) {
        setQuizzes(response.data.data.quizzes)
      }
    } catch (error) {
      addToast('Failed to load quizzes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSeedQuizzes = async () => {
    try {
      setLoading(true)
      const response = await quizAPI.seed()
      if (response.data.data.success) {
        addToast(`${response.data.data.created} quizzes seeded successfully!`, 'success')
        fetchQuizzes()
      }
    } catch (error) {
      addToast('Failed to seed quizzes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return

    try {
      await quizAPI.delete(quizId)
      addToast('Quiz deleted successfully', 'success')
      fetchQuizzes()
    } catch (error) {
      addToast('Failed to delete quiz', 'error')
    }
  }

  const handleViewStatistics = (quizId) => {
    navigate(`/admin/quiz/${quizId}/stats`)
  }

  if (loading && quizzes.length === 0) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Quiz Admin Dashboard</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="bg-white text-indigo-600 hover:bg-gray-100"
          >
            + Create Quiz
          </Button>
        </div>

        {/* Seed Quizzes Button */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={handleSeedQuizzes}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Seed Sample Quizzes
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
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

        {/* Quizzes List */}
        <div className="grid grid-cols-1 gap-4">
          {quizzes.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-600">No quizzes found. Try seeding sample quizzes!</p>
            </Card>
          ) : (
            quizzes.map((quiz) => (
              <Card
                key={quiz.quizId}
                className="bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                    <p className="text-gray-600">{quiz.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Category: <span className="font-semibold">{quiz.category}</span>
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {quiz.questions?.length || 0} Questions
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/quiz/${quiz.quizId}`)}
                    className="text-sm"
                  >
                    View Quiz
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleViewStatistics(quiz.quizId)}
                    className="text-sm"
                  >
                    Statistics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/quiz/${quiz.quizId}/edit`)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteQuiz(quiz.quizId)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
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

export default AdminDashboard