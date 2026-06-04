import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { getApiErrorMessage, quizAPI } from '../services/api'
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

  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const response = await quizAPI.get(quizId)
      const quiz = response.data.data
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || 'General',
        questions: quiz.questions?.length
          ? quiz.questions
          : [
              {
                questionText: '',
                options: ['', '', '', ''],
                correctOption: 0,
                timeLimit: 10,
              },
            ],
      })
    } catch (error) {
      addToast('Failed to load quiz', 'error')
      navigate('/host/dashboard')
    } finally {
      setLoading(false)
    }
  }

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

    const title = formData.title.trim()
    const description = formData.description.trim()
    const category = formData.category.trim()
    const questions = formData.questions.map((question) => ({
      ...question,
      questionText: question.questionText.trim(),
      options: question.options.map((option) => option.trim()),
    }))

    // Validation
    if (title.length < 3) {
      addToast('Quiz title must be at least 3 characters', 'error')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) {
        addToast(`Question ${i + 1} text is required`, 'error')
        return
      }
      if (q.options.some((o) => !o.trim())) {
        addToast(`Question ${i + 1} must have all 4 options filled`, 'error')
        return
      }
    }

    const payload = {
      ...formData,
      title,
      description,
      category,
      questions,
    }

    setLoading(true)

    try {
      if (quizId) {
        await quizAPI.update(quizId, payload)
        addToast('Quiz updated successfully!', 'success')
      } else {
        await quizAPI.create(payload)
        addToast('Quiz created successfully!', 'success')
      }
      navigate('/host/dashboard')
    } catch (error) {
      addToast(getApiErrorMessage(error, 'Failed to save quiz'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl">
        <Card>
          <h1 className="mb-6 text-2xl font-semibold text-slate-950">
            {quizId ? 'Edit Quiz' : 'Create New Quiz'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Metadata */}
            <div className="space-y-4">
              <div>
                <label className="field-label">Quiz Title *</label>
                <Input
                  type="text"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  minLength="3"
                  maxLength="100"
                />
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  placeholder="Enter quiz description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="textarea-field"
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="field-label">Category</label>
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="select-field"
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
            <div className="border-t border-slate-200 pt-6">
              <h2 className="mb-6 text-xl font-semibold text-slate-950">Questions</h2>

              {formData.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="mb-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold text-slate-950">
                      Question {qIndex + 1}
                    </h3>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-sm font-semibold text-danger hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/25"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="field-label">Question Text *</label>
                      <textarea
                        placeholder="Enter question text"
                        value={question.questionText}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, 'questionText', e.target.value)
                        }
                        className="textarea-field"
                        rows="2"
                        required
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex}>
                          <label className="field-label">
                            Option {optIndex + 1}
                            {question.correctOption === optIndex && (
                              <span className="ml-2 text-emerald-600">Correct</span>
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
                            className={`mt-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              question.correctOption === optIndex
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {question.correctOption === optIndex
                              ? 'Correct Answer'
                              : 'Set as Correct'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="field-label">Time Limit (seconds)</label>
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
                className="mb-6 w-full"
              >
                + Add Question
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : quizId ? 'Update Quiz' : 'Create Quiz'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/host/dashboard')}
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
