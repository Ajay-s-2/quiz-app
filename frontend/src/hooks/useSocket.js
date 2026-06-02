import { useCallback, useEffect, useRef } from 'react'
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

  const emit = useCallback((event, data, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.emit(event, data, callback)
      } else {
        socketRef.current.emit(event, data)
      }
    }
  }, [])

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback)
      } else {
        socketRef.current.removeAllListeners(event)
      }
    }
  }, [])

  const once = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.once(event, callback)
    }
  }, [])

  return { socket: socketRef.current, emit, on, off, once, socketEvents }
}

export default useSocket
