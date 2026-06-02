import React from 'react'

export const CountdownTimer = ({ seconds, isActive }) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div
      className={`text-4xl font-bold ${
        isActive ? 'text-danger animate-pulse' : 'text-gray-600'
      }`}
    >
      {minutes}:{secs.toString().padStart(2, '0')}
    </div>
  )
}

export default CountdownTimer
