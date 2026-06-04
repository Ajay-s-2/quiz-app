import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { scoringAPI } from '../services/api'
import { Card, Loading } from '../components/Common'

const LeaderboardPage = () => {
  const { roomCode } = useParams()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  const { on, off, socketEvents } = useSocket()

  useEffect(() => {
    fetchLeaderboard()

    // Listen for leaderboard updates
    on(socketEvents.LEADERBOARD_UPDATE, (data) => {
      setLeaderboard(data.leaderboard)
    })

    on(socketEvents.QUESTION_ENDED, (data) => {
      setLeaderboard(data.leaderboard)
    })

    return () => {
      off(socketEvents.LEADERBOARD_UPDATE, null)
      off(socketEvents.QUESTION_ENDED, null)
    }
  }, [roomCode, on, off, socketEvents])

  const fetchLeaderboard = async () => {
    try {
      const response = await scoringAPI.getLeaderboard(roomCode)
      setLeaderboard(response.data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <h1 className="mb-8 text-center text-2xl font-semibold text-slate-950">Live Leaderboard</h1>

        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No scores yet.</p>
          ) : (
            leaderboard.map((player, idx) => (
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
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                    idx === 0
                      ? 'bg-amber-500'
                    : idx === 1
                      ? 'bg-slate-500'
                    : idx === 2
                      ? 'bg-orange-500'
                      : 'bg-primary'
                  }`}
                >
                  {player.rank}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-950">{player.name}</h3>
                </div>

                <div className="text-2xl font-bold text-slate-950">{player.score}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
