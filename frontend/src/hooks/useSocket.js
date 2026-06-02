import { useEffect, useRef } from 'react'
import { getSocket, socketEvents } from '../services/socket'

export const useSocket = (roomCode) => {
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      // Don't disconnect on unmount to maintain connection across pages
    }
  }, [])

  const emit = (event, data, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.emit(event, data, callback)
      } else {
        socketRef.current.emit(event, data)
      }
    }
  }

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socketRef.current && callback) {
      socketRef.current.off(event, callback)
    }
  }

  const once = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.once(event, callback)
    }
  }

  return { socket: socketRef.current, emit, on, off, once, socketEvents }
}

export default useSocket
