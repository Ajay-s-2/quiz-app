import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authAPI } from '../services/api'
import { Button, Card, Input, Loading } from '../components/Common'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(email, password)
      const session = response.data.data
      setSession(session)
      addToast('Logged in successfully', 'success')

      const fallback = session.user.role === 'admin' ? '/admin' : '/host/dashboard'
      navigate(location.state?.from || fallback)
    } catch (error) {
      addToast(error.response?.data?.message || 'Invalid email or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="host@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              minLength="8"
            />
          </div>

          <Button variant="primary" className="w-full" disabled={loading}>
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          New host?{' '}
          <Link className="text-primary font-semibold" to="/signup">
            Create account
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600 mt-3">
          <Link className="text-primary font-semibold" to="/">
            Back home
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
