import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loading } from './Common'

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/host/dashboard'} replace />
  }

  return children
}

export default ProtectedRoute
