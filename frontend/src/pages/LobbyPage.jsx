import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { roomAPI } from '../services/api'
import { Card, Loading } from '../components/Common'

const LobbyPage = () => {
  const { roomCode } = useParams()
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const { socket, on, off, socketEvents } = useSocket()

  useEffect(() => {
    if (!user || !user.playerId) {
      navigate('/')
      return
    }

    setIsHost(user.isHost || false)
    fetchRoom()

    // Listen for quiz start
    on(socketEvents.QUIZ_STARTED, (data) => {
      setQuizStarted(true)
      addToast('Quiz is starting!', 'success')
      setTimeout(() => {
        navigate(`/quiz/${roomCode}`)
      }, 1500)
    })

    on(socketEvents.PLAYER_JOINED, (data) => {
      setPlayers(data.players)
    })

    on(socketEvents.PLAYER_LEFT, (data) => {
      setPlayers(data.players)
    })

    return () => {
      off(socketEvents.QUIZ_STARTED, null)
      off(socketEvents.PLAYER_JOINED, null)
      off(socketEvents.PLAYER_LEFT, null)
    }
  }, [user, roomCode, navigate, on, off, socketEvents, addToast])

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.get(roomCode)
      setPlayers(response.data.data?.players || [])
    } catch (error) {
      addToast('Failed to load room', 'error')
    }
  }

  if (!user) {
    return <Loading />
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-950">Waiting Room</h1>

        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Room Code</h2>
          <p className="text-center font-mono text-3xl font-bold text-primary">{roomCode}</p>
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Players ({players.length})
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {players.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Waiting for players...</p>
            ) : (
              players.map((player, idx) => (
                <div
                  key={player.playerId || idx}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-slate-800">{player.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {!isHost && (
          <div className="text-center">
            <p className="mb-3 text-sm text-slate-500">Waiting for host...</p>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LobbyPage
