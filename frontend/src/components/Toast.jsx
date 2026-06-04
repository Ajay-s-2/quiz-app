import React from 'react'

const Toast = ({ toast, onRemove }) => {
  const bgColor =
    toast.type === 'success'
      ? 'bg-emerald-50'
      : toast.type === 'error'
      ? 'bg-red-50'
      : 'bg-blue-50'

  const textColor =
    toast.type === 'success'
      ? 'text-emerald-700'
      : toast.type === 'error'
      ? 'text-red-700'
      : 'text-blue-700'

  const borderColor =
    toast.type === 'success'
      ? 'border-emerald-200'
      : toast.type === 'error'
      ? 'border-red-200'
      : 'border-blue-200'

  return (
    <div
      className={`${bgColor} ${textColor} ${borderColor} animate-slideDown rounded-lg border px-4 py-3 text-sm font-medium shadow-soft`}
    >
      {toast.message}
    </div>
  )
}

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default Toast
