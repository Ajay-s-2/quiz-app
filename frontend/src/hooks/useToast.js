import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export default useToast
