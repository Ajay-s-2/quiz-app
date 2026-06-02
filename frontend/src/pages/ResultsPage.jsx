import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Card } from '../components/Common'

const ResultsPage = () => {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    if (location.state?.leaderboard) {
      setLeaderboard(location.state.leaderboard)
    } else {
      // Fallback - navigate back if no data
      setTimeout(() => {
        navigate('/')
      }, 3000)
    }
  }, [location, navigate])

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full text-center">
          <p className="text-gray-600 py-8">Loading results...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Quiz Completed!</h1>

        {/* Winner */}
        {leaderboard[0] && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-8 mb-8 text-center">
            <p className="text-yellow-900 font-semibold text-sm mb-2">🏆 Winner</p>
            <h2 className="text-3xl font-bold text-white mb-2">{leaderboard[0].name}</h2>
            <p className="text-2xl font-bold text-yellow-900">{leaderboard[0].score} points</p>
          </div>
        )}

        {/* Top 3 */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Final Results</h3>
        <div className="space-y-3 mb-8">
          {leaderboard.map((player, idx) => {
            const medals = ['🥇', '🥈', '🥉']
            const medal = idx < 3 ? medals[idx] : '  '

            return (
              <div
                key={player.playerId || idx}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  idx === 0
                    ? 'bg-yellow-100 border-2 border-yellow-400'
                    : idx === 1
                    ? 'bg-gray-100 border-2 border-gray-400'
                    : idx === 2
                    ? 'bg-orange-100 border-2 border-orange-400'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-2xl">{medal}</span>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{player.name}</h3>
                  <p className="text-sm text-gray-600">Rank #{player.rank}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{player.score}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* User Stats */}
        {user && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
            <h4 className="font-bold text-gray-800 mb-2">Your Performance</h4>
            {leaderboard.find((p) => p.playerId === user.playerId) ? (
              <>
                <p className="text-gray-600">
                  You finished in position{' '}
                  <span className="font-bold">
                    #{leaderboard.find((p) => p.playerId === user.playerId)?.rank}
                  </span>
                </p>
                <p className="text-gray-600">
                  Total score:{' '}
                  <span className="font-bold">
                    {leaderboard.find((p) => p.playerId === user.playerId)?.score} points
                  </span>
                </p>
              </>
            ) : (
              <p className="text-gray-600">Thanks for playing!</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
            Play Another Quiz
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ResultsPage
