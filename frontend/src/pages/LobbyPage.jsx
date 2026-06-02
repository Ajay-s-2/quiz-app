import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
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

  if (!user) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 py-8">
      <Card className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Waiting Room</h1>

        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Room Code</h2>
          <p className="text-2xl font-bold text-indigo-600 text-center">{roomCode}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Players ({players.length})
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Waiting for players...</p>
            ) : (
              players.map((player, idx) => (
                <div
                  key={player.playerId || idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-800">{player.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {!isHost && (
          <div className="text-center">
            <p className="text-gray-600 mb-3">Waiting for host to start the quiz...</p>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LobbyPage
