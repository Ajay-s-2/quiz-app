import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { QuizProvider } from './contexts/QuizContext'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/Toast'
import Routes from './routes'

function AppWithProviders() {
  const { toasts, removeToast } = useToast()

  return (
    <AuthProvider>
      <QuizProvider>
        <div className="min-h-screen">
          <Routes />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </QuizProvider>
    </AuthProvider>
  )
}

export default AppWithProviders
