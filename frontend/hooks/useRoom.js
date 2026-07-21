'use client'

import { getSocket } from "@/lib/socket"
import { useEffect, useState } from "react"

export function useRoom(roomId) {
    const [room, setRoom] = useState()
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!roomId) return;
        const socket = getSocket()
        const handleRoomUpdate = (updateRoom) => {
            setRoom(updateRoom)
        }
        const handleError = (error) => {
            setError(error.message)
        }
        socket.on('room_update', handleRoomUpdate)
        socket.on('error', handleError);
        socket.emit('request_room_state', { roomId });

        return () => {
            socket.off('room_update', handleRoomUpdate)
            socket.off('error', handleError)
            
        }
    }, [roomId])

    return {room,error}

}