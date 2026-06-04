import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authAPI, getApiErrorMessage } from '../services/api'
import { Button, Card, EyeIcon, Input, Loading } from '../components/Common'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { setSession } = useAuth()
  const { addToast } = useToast()

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password

    if (name.length < 2) {
      addToast('Name must be at least 2 characters', 'error')
      return
    }

    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.signup({
        name,
        email,
        password,
      })
      setSession(response.data.data)
      addToast('Account created successfully', 'success')
      navigate('/host/dashboard')
    } catch (error) {
      addToast(getApiErrorMessage(error, 'Failed to create account'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Create Account</h1>
          <p className="mt-1 text-sm text-slate-500">Start hosting live quizzes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Name</label>
            <Input
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="Your name"
              required
              minLength="2"
              maxLength="80"
            />
          </div>

          <div>
            <label className="field-label">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="host@example.com"
              required
              maxLength="254"
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder="At least 8 characters"
                required
                minLength="8"
                maxLength="128"
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25"
                onClick={() => setShowPassword((current) => !current)}
              >
                <EyeIcon hidden={showPassword} className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="field-label">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                placeholder="Repeat password"
                required
                minLength="8"
                maxLength="128"
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25"
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                <EyeIcon hidden={showConfirmPassword} className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Button variant="primary" className="w-full" disabled={loading}>
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-primary hover:text-primary-dark" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default SignupPage
