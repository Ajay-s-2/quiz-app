import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fadeIn">
          Quiz App
        </h1>
        <p className="text-xl text-indigo-100 mb-12">
          Real-time interactive quizzes for everyone
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/host">
            <button className="btn-primary text-lg">
              Create & Host Quiz
            </button>
          </Link>
          <Link to="/join">
            <button className="btn-outline text-lg">Join Quiz</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
