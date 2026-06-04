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
      <div className="page-shell flex items-center justify-center">
        <Card className="w-full max-w-2xl text-center">
          <p className="py-8 text-sm text-slate-500">Loading results...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-semibold text-slate-950">Quiz Completed</h1>

        {/* Winner */}
        {leaderboard[0] && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="mb-2 text-sm font-semibold text-amber-700">Winner</p>
            <h2 className="mb-2 text-3xl font-bold text-slate-950">{leaderboard[0].name}</h2>
            <p className="text-2xl font-bold text-amber-700">{leaderboard[0].score} points</p>
          </div>
        )}

        {/* Top 3 */}
        <h3 className="mb-4 text-xl font-semibold text-slate-950">Final Results</h3>
        <div className="space-y-3 mb-8">
          {leaderboard.map((player, idx) => {
            const medals = ['1', '2', '3']
            const medal = idx < 3 ? medals[idx] : '  '

            return (
              <div
                key={player.playerId || idx}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  idx === 0
                    ? 'border-amber-200 bg-amber-50'
                    : idx === 1
                    ? 'border-slate-300 bg-slate-50'
                    : idx === 2
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className="w-8 text-center text-lg font-bold text-slate-700">{medal}</span>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-950">{player.name}</h3>
                  <p className="text-sm text-slate-500">Rank #{player.rank}</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-950">{player.score}</p>
                  <p className="text-sm text-slate-500">points</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* User Stats */}
        {user && (
          <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-slate-950">Your Performance</h4>
            {leaderboard.find((p) => p.playerId === user.playerId) ? (
              <>
                <p className="text-sm text-slate-600">
                  You finished in position{' '}
                  <span className="font-bold">
                    #{leaderboard.find((p) => p.playerId === user.playerId)?.rank}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  Total score:{' '}
                  <span className="font-bold">
                    {leaderboard.find((p) => p.playerId === user.playerId)?.score} points
                  </span>
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-600">Thanks for playing.</p>
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
