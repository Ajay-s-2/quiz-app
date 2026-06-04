import React from 'react'

export const Loading = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.14),transparent_18%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)]">
      <div className="glass-panel px-8 py-8 text-center">
        <div className="mx-auto inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-primary"></div>
        <p className="mt-4 text-lg text-slate-100">Loading your quiz space...</p>
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
  const baseClasses = 'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-soft transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40'
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-glow',
    secondary: 'bg-gradient-to-r from-accent to-secondary text-white hover:shadow-glow',
    outline: 'border border-white/20 bg-white/10 text-slate-100 hover:bg-white/15 hover:text-white',
    danger: 'bg-gradient-to-r from-danger to-rose-500 text-white hover:shadow-glow',
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
  return <div className={`glass-panel p-6 ${className}`}>{children}</div>
}

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full rounded-2xl border border-white/15 bg-slate-950/35 px-4 py-3 text-slate-100 placeholder:text-slate-300 shadow-soft outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40 ${className}`}
      {...props}
    />
  )
}

export default {
  Loading,
  Button,
  Card,
  Input,
}
