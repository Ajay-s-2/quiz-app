import React from 'react'

export const CountdownTimer = ({ seconds, isActive }) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div
      className={`rounded-lg px-3 py-2 text-3xl font-bold ${
        isActive ? 'bg-red-50 text-danger' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {minutes}:{secs.toString().padStart(2, '0')}
    </div>
  )
}

export default CountdownTimer
