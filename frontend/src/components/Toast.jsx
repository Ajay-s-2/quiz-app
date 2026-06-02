import React from 'react'

const Toast = ({ toast, onRemove }) => {
  const bgColor =
    toast.type === 'success'
      ? 'bg-green-100'
      : toast.type === 'error'
      ? 'bg-red-100'
      : 'bg-blue-100'

  const textColor =
    toast.type === 'success'
      ? 'text-green-700'
      : toast.type === 'error'
      ? 'text-red-700'
      : 'text-blue-700'

  const borderColor =
    toast.type === 'success'
      ? 'border-green-400'
      : toast.type === 'error'
      ? 'border-red-400'
      : 'border-blue-400'

  return (
    <div
      className={`${bgColor} ${textColor} ${borderColor} border px-4 py-3 rounded shadow-md animate-slideDown`}
    >
      {toast.message}
    </div>
  )
}

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default Toast
