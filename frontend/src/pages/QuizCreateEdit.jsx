import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { quizAPI } from '../services/api'
import { Card, Button, Input, Loading } from '../components/Common'

const QuizCreateEdit = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOption: 0,
        timeLimit: 10,
      },
    ],
  })

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value })
  }

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value })
  }

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value })
  }

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[qIndex][field] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[qIndex].options[optIndex] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOption: 0,
          timeLimit: 10,
        },
      ],
    })
  }

  const removeQuestion = (qIndex) => {
    if (formData.questions.length === 1) {
      addToast('Quiz must have at least one question', 'warning')
      return
    }
    const newQuestions = formData.questions.filter((_, i) => i !== qIndex)
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      addToast('Quiz title is required', 'error')
      return
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.questionText.trim()) {
        addToast(`Question ${i + 1} text is required`, 'error')
        return
      }
      if (q.options.some((o) => !o.trim())) {
        addToast(`Question ${i + 1} must have all 4 options filled`, 'error')
        return
      }
    }

    setLoading(true)

    try {
      if (quizId) {
        await quizAPI.update(quizId, formData)
        addToast('Quiz updated successfully!', 'success')
      } else {
        const response = await quizAPI.create(formData)
        addToast('Quiz created successfully!', 'success')
      }
      navigate('/admin')
    } catch (error) {
      addToast('Failed to save quiz', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {quizId ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Metadata */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Quiz Title *
                </label>
                <Input
                  type="text"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter quiz description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="General">General Knowledge</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
            </div>

            {/* Questions */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Questions</h2>

              {formData.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="mb-8 p-6 border-2 border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {qIndex + 1}
                    </h3>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        placeholder="Enter question text"
                        value={question.questionText}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, 'questionText', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="2"
                        required
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Option {optIndex + 1}
                            {question.correctOption === optIndex && (
                              <span className="text-green-600 ml-2">✓ Correct</span>
                            )}
                          </label>
                          <Input
                            type="text"
                            placeholder={`Enter option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, optIndex, e.target.value)
                            }
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuestionChange(qIndex, 'correctOption', optIndex)
                            }
                            className={`mt-2 text-sm px-3 py-1 rounded ${
                              question.correctOption === optIndex
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {question.correctOption === optIndex
                              ? '✓ Correct Answer'
                              : 'Set as Correct'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time Limit (seconds)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        value={question.timeLimit}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value, 10))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={addQuestion}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-6"
              >
                + Add Question
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={loading}
              >
                {loading ? 'Saving...' : quizId ? 'Update Quiz' : 'Create Quiz'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default QuizCreateEdit