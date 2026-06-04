import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { Button, Input, Card, Loading } from '../components/Common'

const JoinPage = () => {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const navigate = useNavigate()
  const { setUserData } = useAuth()
  const { addToast } = useToast()
  const { socket, emit, on, off, socketEvents } = useSocket()

  useEffect(() => {
    // Listen for join-room response
    on(socketEvents.PLAYER_JOINED, (data) => {
      // Player successfully joined
    })

    return () => {
      off(socketEvents.PLAYER_JOINED, null)
    }
  }, [on, off, socketEvents])

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setConnecting(true)

    try {
      if (!playerName.trim() || !roomCode.trim()) {
        addToast('Please fill in all fields', 'error')
        setLoading(false)
        setConnecting(false)
        return
      }

      if (roomCode.length !== 6) {
        addToast('Room code must be 6 characters', 'error')
        setLoading(false)
        setConnecting(false)
        return
      }

      // Emit join-room event
      emit(socketEvents.JOIN_ROOM, { roomCode: roomCode.toUpperCase(), playerName }, (response) => {
        setLoading(false)

        if (!response || !response.success) {
          addToast(response?.error || 'Failed to join room', 'error')
          setConnecting(false)
          return
        }

        // Store user data
        setUserData({
          playerId: response.playerId,
          playerName,
          roomCode: roomCode.toUpperCase(),
          isHost: false,
          quizId: response.quizId,
        })

        addToast(`Joined as ${playerName}!`, 'success')
        navigate(`/lobby/${roomCode.toUpperCase()}`)
      })
    } catch (error) {
      setLoading(false)
      setConnecting(false)
      addToast('Connection failed. Please try again.', 'error')
    }
  }

  if (connecting && loading) {
    return <Loading />
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Join Quiz</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your name and room code.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="field-label">Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="field-label">Room Code</label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              disabled={loading}
              required
              maxLength="6"
              className="text-center font-mono text-lg uppercase"
            />
          </div>

          <Button variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Joining...' : 'Join Quiz'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default JoinPage
