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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Live Leaderboard</h1>

        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No scores yet</p>
          ) : (
            leaderboard.map((player, idx) => (
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
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0
                      ? 'bg-yellow-500'
                      : idx === 1
                      ? 'bg-gray-500'
                      : idx === 2
                      ? 'bg-orange-500'
                      : 'bg-primary'
                  }`}
                >
                  {player.rank}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{player.name}</h3>
                </div>

                <div className="text-2xl font-bold text-gray-800">{player.score}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default LeaderboardPage
