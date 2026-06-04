import React from 'react'

export const Loading = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-7 text-center shadow-soft">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Loading...</p>
      </div>
    </div>
  )
}

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/30',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus:ring-primary/25',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-500/30',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Card = ({ children, className = '' }) => {
  return <div className={`rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-soft ${className}`}>{children}</div>
}

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`input-field ${className}`}
      {...props}
    />
  )
}

export const EyeIcon = ({ hidden = false, className = '' }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Z"
      />
      {hidden && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 4.5 19.5 19.5"
        />
      )}
    </svg>
  )
}

export default {
  Loading,
  Button,
  Card,
  Input,
  EyeIcon,
}
