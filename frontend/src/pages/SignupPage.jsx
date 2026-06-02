import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { authAPI } from '../services/api'
import { Button, Card, Input, Loading } from '../components/Common'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { setSession } = useAuth()
  const { addToast } = useToast()

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      setSession(response.data.data)
      addToast('Account created successfully', 'success')
      navigate('/host/dashboard')
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create account', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="host@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              placeholder="At least 8 characters"
              required
              minLength="8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(event) => handleChange('confirmPassword', event.target.value)}
              placeholder="Repeat password"
              required
              minLength="8"
            />
          </div>

          <Button variant="primary" className="w-full" disabled={loading}>
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link className="text-primary font-semibold" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default SignupPage
