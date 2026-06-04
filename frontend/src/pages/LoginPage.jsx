import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authAPI, getApiErrorMessage } from '../services/api'
import { Button, Card, EyeIcon, Input, Loading } from '../components/Common'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.login(email.trim(), password)
      const session = response.data.data
      setSession(session)
      addToast('Logged in successfully', 'success')

      const fallback = session.user.role === 'admin' ? '/admin' : '/host/dashboard'
      navigate(location.state?.from || fallback)
    } catch (error) {
      addToast(getApiErrorMessage(error, 'Invalid email or password'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Login</h1>
          <p className="mt-1 text-sm text-slate-500">Access your quiz workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
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

          <Button variant="primary" className="w-full" disabled={loading}>
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New host?{' '}
          <Link className="font-semibold text-primary hover:text-primary-dark" to="/signup">
            Create account
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-slate-600">
          <Link className="font-semibold text-primary hover:text-primary-dark" to="/">
            Home
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
