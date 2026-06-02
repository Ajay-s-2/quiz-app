import React from 'react'

export const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar
