import React from 'react'

export const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-primary transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar
