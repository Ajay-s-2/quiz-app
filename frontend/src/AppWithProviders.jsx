import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { QuizProvider } from './contexts/QuizContext'
import { ToastProvider, useToast } from './hooks/useToast'
import { ToastContainer } from './components/Toast'
import Routes from './routes'

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="min-h-screen">
      <Routes />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

function AppWithProviders() {
  return (
    <ToastProvider>
      <AuthProvider>
        <QuizProvider>
          <AppContent />
        </QuizProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default AppWithProviders
